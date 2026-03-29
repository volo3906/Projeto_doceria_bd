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
| cpf | VARCHAR(14) | NOT NULL, UNIQUE |
| email | VARCHAR(100) | NOT NULL |
| telefone | VARCHAR(20) | NOT NULL |
| torce_flamengo | BOOLEAN | NOT NULL, DEFAULT false |
| assiste_one_piece | BOOLEAN | NOT NULL, DEFAULT false |
| de_sousa | BOOLEAN | NOT NULL, DEFAULT false |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Tabela `vendas`

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| cliente_id | INTEGER | NOT NULL, FK → clientes(id) ON DELETE RESTRICT |
| doce_id | INTEGER | NOT NULL, FK → doces(id) ON DELETE RESTRICT |
| quantidade | INTEGER | NOT NULL, CHECK > 0 |
| valor_total | NUMERIC(10,2) | NOT NULL, CHECK >= 0 |
| data_venda | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Diagrama de Relacionamentos

```
doces (1) ←──── (N) vendas (N) ────→ (1) clientes
```

- Um doce pode estar em varias vendas
- Um cliente pode ter varias vendas
- Cada venda referencia exatamente um doce e um cliente

---

## Constraints e Integridade

### Chaves Estrangeiras (ON DELETE RESTRICT)

As FKs de `vendas` usam `ON DELETE RESTRICT`, ou seja:
- **Nao eh possivel deletar um doce** que ja foi vendido
- **Nao eh possivel deletar um cliente** que ja fez uma compra

Isso garante que o historico de vendas nunca fique com referencias quebradas.

### UNIQUE no CPF

A coluna `cpf` da tabela `clientes` tem constraint UNIQUE. O sistema retorna erro se tentar cadastrar dois clientes com o mesmo CPF.

### CHECK Constraints

- `preco >= 0` e `estoque >= 0` nos doces
- `quantidade > 0` e `valor_total >= 0` nas vendas

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

O mapeamento eh feito pelos metodos privados `formatarDoce()`, `formatarCliente()` e `formatarVenda()` dentro do `GerenciadorDoceria`.

---

## Transacoes

O metodo `registrarVenda()` usa uma **transacao** com `BEGIN`, `COMMIT` e `ROLLBACK`:

1. Verifica se o cliente existe
2. Busca o doce com `SELECT ... FOR UPDATE` (trava a linha pra evitar condicao de corrida)
3. Verifica se tem estoque suficiente
4. Desconta o estoque
5. Insere a venda com o valor total calculado
6. Faz COMMIT se tudo deu certo, ou ROLLBACK se algo falhou

O `FOR UPDATE` garante que duas vendas simultaneas do mesmo doce nao vendam mais do que tem em estoque.

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
│   └── init.sql                # schema + dados iniciais
├── .env                        # credenciais (gitignored)
├── .env.example                # template de credenciais
└── src/
    ├── lib/
    │   ├── db.ts               # pool de conexao
    │   └── dados.ts            # instancia do gerenciador
    └── services/
        └── GerenciadorDoceria.ts   # 24 metodos async com SQL
```

---

## Dados Iniciais (Seed)

O `init.sql` insere dados de demonstracao na primeira vez que o banco eh criado:

- **5 doces:** Brigadeiro, Beijinho, Cajuzinho, Cocada, Trufa de Morango
- **3 clientes:** Joao Silva, Maria Oliveira, Pedro Santos

Esses dados permitem testar o sistema sem precisar cadastrar tudo manualmente.
