# Banco de Dados — Doceria Gourmet

## Visao Geral

O sistema usa **PostgreSQL 16** como banco de dados relacional. O banco roda dentro de um container Docker na porta **5433** e eh gerenciado pelo `docker-compose.yml` na raiz do projeto.

A aplicacao Next.js se conecta ao banco usando a biblioteca `pg` (node-postgres), com um pool de conexoes configurado em `src/lib/db.ts`.

---

## Arquitetura de Conexao

```
Next.js (porta 3303)
    |
    v
src/lib/db.ts (Pool de conexoes, max 10)
    |
    v
PostgreSQL 16 (porta 5433, container Docker)
    |
    v
Volume persistente (pgdata)
```

### Fluxo:

1. O arquivo `src/lib/db.ts` cria um **Pool** de conexoes usando a variavel de ambiente `DATABASE_URL`
2. O pool eh armazenado em `globalThis` pra evitar que o hot reload do Next.js crie conexoes novas a cada mudanca de arquivo
3. O `GerenciadorDoceria` (`src/services/GerenciadorDoceria.ts`) importa o pool e faz todas as queries SQL
4. O arquivo `src/lib/dados.ts` exporta uma instancia do `GerenciadorDoceria` pra ser usada pelas API routes

### Caminho completo de uma request:

```
Browser → API Route → dados.ts (gerenciador) → GerenciadorDoceria → pool (db.ts) → PostgreSQL
```

---

## Schema do Banco

O schema eh definido em `sql/init.sql` e executado automaticamente quando o container Docker eh criado pela primeira vez.

### Tabela `doces`

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| nome | VARCHAR(100) | NOT NULL |
| categoria | VARCHAR(50) | NOT NULL |
| preco | NUMERIC(10,2) | NOT NULL, CHECK >= 0 |
| estoque | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 |
| fabricado_em_mari | BOOLEAN | NOT NULL, DEFAULT false |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Tabela `clientes`

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| nome | VARCHAR(100) | NOT NULL |
| cpf | VARCHAR(11) | NOT NULL, UNIQUE (somente digitos) |
| email | VARCHAR(100) | NOT NULL |
| telefone | VARCHAR(13) | NOT NULL (somente digitos com DDI) |
| torce_flamengo | BOOLEAN | NOT NULL, DEFAULT false |
| assiste_one_piece | BOOLEAN | NOT NULL, DEFAULT false |
| de_sousa | BOOLEAN | NOT NULL, DEFAULT false |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Tabela `vendedores`

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| nome | VARCHAR(100) | NOT NULL |
| cpf | VARCHAR(11) | NOT NULL, UNIQUE (somente digitos) |
| email | VARCHAR(100) | NOT NULL |
| telefone | VARCHAR(13) | NOT NULL (somente digitos com DDI) |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Tabela `vendas`

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| cliente_id | INTEGER | NOT NULL, FK → clientes(id) ON DELETE RESTRICT |
| doce_id | INTEGER | NOT NULL, FK → doces(id) ON DELETE RESTRICT |
| vendedor_id | INTEGER | NOT NULL, FK → vendedores(id) ON DELETE RESTRICT |
| quantidade | INTEGER | NOT NULL, CHECK > 0 |
| valor_total | NUMERIC(10,2) | NOT NULL, CHECK >= 0 (com desconto) |
| forma_pagamento | VARCHAR(20) | NOT NULL, CHECK IN (cartao, boleto, pix, berries, dinheiro) |
| status_pagamento | VARCHAR(20) | CHECK IN (confirmado, pendente, recusado) |
| data_venda | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Tabela `itens_venda`

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| venda_id | INTEGER | NOT NULL, FK → vendas(id) ON DELETE CASCADE |
| doce_id | INTEGER | NOT NULL, FK → doces(id) ON DELETE RESTRICT |
| quantidade | INTEGER | NOT NULL, CHECK > 0 |
| subtotal | NUMERIC(10,2) | NOT NULL, CHECK >= 0 |

Cada linha representa um doce dentro de uma venda. Uma venda pode ter N itens.

### Diagrama de Relacionamentos

```
                    itens_venda
                   /           \
doces (1) ←── (N) itens  vendas (N) ────→ (1) clientes
                           |
                           N
                           |
                   vendedores (1)
```

- Uma venda pode ter varios itens (cada item e um doce diferente)
- Um doce pode aparecer em varios itens de vendas diferentes
- Um cliente pode ter varias vendas
- Um vendedor pode efetivar varias vendas
- Cada venda referencia exatamente um doce, um cliente e um vendedor

---

## Constraints e Integridade

### Chaves Estrangeiras (ON DELETE RESTRICT)

As FKs de `vendas` usam `ON DELETE RESTRICT`, ou seja:
- **Nao eh possivel deletar um doce** que ja foi vendido
- **Nao eh possivel deletar um cliente** que ja fez uma compra
- **Nao eh possivel deletar um vendedor** que ja efetivou uma venda

Isso garante que o historico de vendas nunca fique com referencias quebradas.

### UNIQUE no CPF

As colunas `cpf` de `clientes` e `vendedores` tem constraint UNIQUE. CPFs sao armazenados como somente digitos (11 caracteres). Telefones tambem sao somente digitos com DDI (13 caracteres).

### CHECK Constraints

- `preco >= 0` e `estoque >= 0` nos doces
- `quantidade > 0` e `valor_total >= 0` nas vendas
- `forma_pagamento` IN (cartao, boleto, pix, berries, dinheiro)
- `status_pagamento` IN (confirmado, pendente, recusado)

Essas validacoes estao no nivel do banco, entao mesmo que a aplicacao tenha algum bug, valores invalidos nunca sao gravados.

---

## Tipos de Dados e Mapeamento

### NUMERIC para dinheiro

Campos de valor monetario (`preco`, `valor_total`) usam `NUMERIC(10,2)` em vez de `FLOAT`. Isso evita erros de arredondamento com dinheiro.

O driver `pg` retorna NUMERIC como **string** (ex: `"4.50"`), entao o `GerenciadorDoceria` converte com `parseFloat()` nos metodos `formatarDoce` e `formatarVenda`.

### snake_case → camelCase

O banco usa **snake_case** (padrao SQL):
- `fabricado_em_mari`, `cliente_id`, `data_venda`

A API retorna **camelCase** (padrao JavaScript):
- `fabricadoEmMari`, `clienteId`, `dataVenda`

O mapeamento eh feito pelos metodos privados `formatarDoce()`, `formatarCliente()`, `formatarVenda()` e `formatarVendedor()` dentro do `GerenciadorDoceria`.

---

## Stored Procedure — sp_registrar_venda

O registro de vendas eh feito por uma stored procedure no PostgreSQL. O codigo TypeScript chama `SELECT * FROM sp_registrar_venda(...)` em vez de fazer a logica manualmente.

A procedure faz tudo atomicamente:

1. Verifica se o cliente, doce e vendedor existem
2. Busca o doce com `FOR UPDATE` (trava a linha)
3. Verifica se tem estoque suficiente
4. Consulta a view `vw_clientes_com_desconto` pra verificar elegibilidade
5. Calcula desconto: 5% por flag ativa (flamengo, one piece, sousa), soma direta
6. Aplica limite maximo de 15% (preparado pra escalar com mais criterios no futuro)
7. Calcula valor total com desconto aplicado
8. Desconta o estoque
9. Insere a venda
10. Retorna a venda criada + percentual de desconto

O `FOR UPDATE` garante que duas vendas simultaneas do mesmo doce nao vendam mais do que tem em estoque.

---

## View — vw_clientes_com_desconto

View que lista os clientes elegiveis a desconto (pelo menos uma flag ativa):

```sql
SELECT * FROM vw_clientes_com_desconto;
```

Usada pela stored procedure pra verificar se o cliente tem desconto antes de calcular o valor.

---

## Sistema de Migrations

Em vez de recriar o banco pra aplicar mudancas no schema, o projeto usa migrations sequenciais:

- **Pasta:** `sql/migrations/` (arquivos numerados: 001, 002, 003...)
- **Script:** `node scripts/migrate.mjs` — roda as migrations pendentes
- **Controle:** tabela `migrations_executadas` registra quais ja rodaram
- Cada migration roda em transacao (COMMIT/ROLLBACK)

```bash
# rodar migrations pendentes
node scripts/migrate.mjs
```

### Migrations existentes:
- `001_normalizar_cpf_telefone.sql` — converte CPF/telefone pra somente digitos
- `002_criar_views.sql` — cria view de clientes com desconto
- `003_stored_procedure_registrar_venda.sql` — cria procedure de venda com desconto
- `004_limite_desconto_15_porcento.sql` — adiciona limite maximo de 15% no desconto
- `005_criar_indices.sql` — cria indices B-tree nas FKs de vendas
- `006_criar_itens_vendas.sql` — separa itens da venda em tabela propria (1 venda = N doces)
- `007_bloquear_pagamento_recusado.sql` — procedure rejeita venda com status recusado

---

## Indices

O PostgreSQL cria indices automaticamente pra PK e UNIQUE, mas **nao pra FK**. Sem indice nas FKs, consultas por cliente/doce/vendedor na tabela de vendas fazem sequential scan (leem tudo).

### Indices criados:

| Indice | Tabela | Coluna | Motivo |
|--------|--------|--------|--------|
| `idx_vendas_cliente_id` | vendas | cliente_id | Buscar vendas de um cliente + verificacao FK no DELETE |
| `idx_vendas_doce_id` | vendas | doce_id | Stored procedure FOR UPDATE + verificacao FK |
| `idx_vendas_vendedor_id` | vendas | vendedor_id | Relatorio por vendedor + verificacao FK |
| `idx_itens_venda_venda_id` | itens_venda | venda_id | Buscar itens de uma venda |
| `idx_itens_venda_doce_id` | itens_venda | doce_id | Verificacao FK ao deletar doce |

### Indices automaticos (PK e UNIQUE):

| Indice | Tabela | Coluna |
|--------|--------|--------|
| `doces_pkey` | doces | id |
| `clientes_pkey` | clientes | id |
| `clientes_cpf_key` | clientes | cpf |
| `vendedores_pkey` | vendedores | id |
| `vendedores_cpf_unique` | vendedores | cpf |
| `vendas_pkey` | vendas | id |

---

## Docker

O banco roda em um container Docker definido no `docker-compose.yml`:

- **Imagem:** `postgres:16-alpine` (versao leve)
- **Porta:** `5433` no host → `5432` no container
- **Volume:** `pgdata` — dados persistem mesmo se o container for recriado
- **Init script:** `sql/init.sql` montado em `/docker-entrypoint-initdb.d/` — executa automaticamente na primeira vez

### Comandos uteis

```bash
# subir o banco
docker compose up -d

# verificar se esta rodando
docker compose ps

# ver as tabelas
docker exec doceria-db psql -U doceria -d doceria -c "\dt"

# ver dados de uma tabela
docker exec doceria-db psql -U doceria -d doceria -c "SELECT * FROM doces"

# parar o banco
docker compose down

# parar e apagar os dados (cuidado!)
docker compose down -v
```

---

## Configuracao

As credenciais de conexao ficam no arquivo `.env` (que **nao eh commitado** por seguranca). O arquivo `.env.example` serve como template:

```
POSTGRES_DB=doceria
POSTGRES_USER=doceria
POSTGRES_PASSWORD=TROCAR_PELA_SENHA_REAL
DATABASE_URL=postgresql://doceria:TROCAR_PELA_SENHA_REAL@localhost:5433/doceria
```

Para conectar remotamente, basta trocar `localhost` pelo IP do servidor na `DATABASE_URL`.

---

## Estrutura de Arquivos

```
Projeto_doceria_bd/
├── docker-compose.yml          # container PostgreSQL
├── sql/
│   ├── init.sql                # schema + dados iniciais
│   ├── views.sql               # views (referencia)
│   └── migrations/             # migrations sequenciais
│       ├── 001_normalizar_cpf_telefone.sql
│       ├── 002_criar_views.sql
│       └── 003_stored_procedure_registrar_venda.sql
├── scripts/
│   └── migrate.mjs             # roda migrations pendentes
├── .env                        # credenciais (gitignored)
├── .env.example                # template de credenciais
└── src/
    ├── lib/
    │   ├── db.ts               # pool de conexao
    │   ├── dados.ts            # instancia do gerenciador
    │   └── utils.ts            # helpers de formatacao (CPF, telefone, preco)
    └── services/
        └── GerenciadorDoceria.ts   # operacoes do sistema + stored procedure
```

---

## Dados Iniciais (Seed)

O `init.sql` insere dados de demonstracao na primeira vez que o banco eh criado:

- **5 doces:** Brigadeiro, Beijinho, Cajuzinho, Cocada, Trufa de Morango
- **3 clientes:** Joao Silva, Maria Oliveira, Pedro Santos
- **3 vendedores:** Ana Silva, Carlos Souza, Lucia Martins

CPFs e telefones no seed data sao armazenados como somente digitos. A formatacao (123.456.789-00, +55 (83) 99999-0001) eh feita no frontend.
