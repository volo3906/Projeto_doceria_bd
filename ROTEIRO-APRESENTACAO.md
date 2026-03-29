# Roteiro de Apresentacao — Parte 1 (7 minutos)

> Apresentacao online. Base de dados ja deve estar populada.
> Cada um fala sobre O QUE FEZ. Nao precisa mostrar codigo, foca em explicar e demonstrar.

---

## Divisao de Tempo

| Quem | Tempo | O que fala |
|------|-------|------------|
| **Johan** | ~3 min | Infra, banco de dados, schema, constraints, Docker |
| **Parceiro** | ~3 min | Codigo do servico, rotas da API, como conecta no banco |
| **Ambos** | ~1 min | Demo ao vivo no navegador |

---

## PARTE DO JOHAN (~3 minutos)

### 1. Introducao rapida (30s)

> "Nosso projeto e um sistema de gerenciamento para uma doceria. Tem 3 entidades: Doces, Clientes e Vendas. Tudo roda com Next.js no frontend e PostgreSQL 16 como banco de dados."

- Tema: Doceria Gourmet
- Stack: Next.js + TypeScript + PostgreSQL 16
- 3 entidades principais, 5 paginas, API REST

### 2. Banco de Dados — Schema (1 min)

**Abrir o DBeaver ou pgAdmin mostrando as 3 tabelas, ou mostrar o `init.sql`.**

> "Eu fui responsavel por toda a parte de infraestrutura e modelagem do banco."

**Tabela `doces` (7 colunas):**
- `id SERIAL PRIMARY KEY` — chave primaria auto-incremento
- `nome VARCHAR(100) NOT NULL` — nome do doce, obrigatorio
- `categoria VARCHAR(50) NOT NULL` — tipo do doce (Chocolate, Coco, etc)
- `preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0)` — preco em reais, nao pode ser negativo
- `estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0)` — quantidade disponivel, nao pode ser negativo
- `fabricado_em_mari BOOLEAN NOT NULL DEFAULT false` — se e fabricado na cidade de Mari
- `criado_em TIMESTAMP NOT NULL DEFAULT NOW()` — data de criacao automatica

**Tabela `clientes` (9 colunas):**
- `id SERIAL PRIMARY KEY`
- `nome, email, telefone` — dados basicos, todos NOT NULL
- `cpf VARCHAR(14) NOT NULL UNIQUE` — **constraint UNIQUE impede CPF duplicado**
- `torce_flamengo, assiste_one_piece, de_sousa` — 3 flags booleanas para criterio de desconto
- `criado_em TIMESTAMP`

**Tabela `vendas` (6 colunas):**
- `id SERIAL PRIMARY KEY`
- `cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT`
- `doce_id INTEGER NOT NULL REFERENCES doces(id) ON DELETE RESTRICT`
- `quantidade INTEGER NOT NULL CHECK (quantidade > 0)` — tem que ser positivo
- `valor_total NUMERIC(10,2) NOT NULL CHECK (valor_total >= 0)`
- `data_venda TIMESTAMP NOT NULL DEFAULT NOW()`

### 3. Relacionamentos e Constraints (1 min)

> "O banco garante a integridade dos dados por conta propria, sem depender do codigo."

**Relacionamentos:**
- `vendas.cliente_id` → `clientes.id` (N:1) — uma venda pertence a UM cliente, um cliente pode ter VARIAS vendas
- `vendas.doce_id` → `doces.id` (N:1) — uma venda pertence a UM doce, um doce pode estar em VARIAS vendas

**ON DELETE RESTRICT:**
> "Se eu tentar deletar um cliente que ja tem vendas, o banco REJEITA. Nao deixa deletar. Isso protege a integridade — nao fica venda orfao sem cliente."

**CHECK constraints:**
- Preco nunca fica negativo (mesmo se alguem mandar valor errado pela API)
- Estoque nunca fica negativo
- Quantidade da venda tem que ser maior que zero

**UNIQUE no CPF:**
> "O banco nao deixa cadastrar dois clientes com o mesmo CPF. Isso e feito direto no banco, nao no codigo."

**Tipos de dados:**
- `NUMERIC(10,2)` para dinheiro — evita problemas de arredondamento que float causa
- `VARCHAR` com tamanhos definidos
- `TIMESTAMP` com `DEFAULT NOW()` — data automatica

### 4. Docker e Infraestrutura (30s)

> "O PostgreSQL roda dentro de um container Docker. Eu criei o docker-compose.yml que sobe o banco automaticamente."

- PostgreSQL 16 Alpine (imagem leve)
- Porta 5433 no host (pra nao conflitar com outros bancos)
- Volume `pgdata` — dados persistem mesmo reiniciando o container
- `init.sql` montado em `/docker-entrypoint-initdb.d/` — executa automaticamente na primeira vez
- Seed data: 5 doces e 3 clientes ja vem prontos pra demonstracao
- Credenciais no `.env` (gitignored, nao vai pro repositorio)

---

## PARTE DO PARCEIRO (~3 minutos)

### 1. Conexao com o Banco (30s)

> "Eu fui responsavel por toda a parte do codigo que conversa com o banco de dados."

**Mostrar `src/lib/db.ts` (14 linhas):**
- Usa a biblioteca `pg` (node-postgres) — SQL direto, sem ORM
- Pool de conexoes (max 10) — reutiliza conexoes em vez de abrir/fechar toda hora
- `DATABASE_URL` vem do `.env` — credenciais ficam fora do codigo

### 2. GerenciadorDoceria — O Servico Principal (1 min 30s)

> "O GerenciadorDoceria e a classe que faz TODA a comunicacao com o banco. Sao 24 metodos async."

**Organizacao:**
- 9 metodos de doces (listar, buscar por id/nome/categoria, cadastrar, atualizar, remover, contar, calcular estoque)
- 8 metodos de clientes (listar, buscar por id/nome/cpf, cadastrar, atualizar, remover, contar)
- 6 metodos de vendas (listar, buscar por id/cliente, registrar, contar, calcular total)
- 1 metodo de relatorio (gera resumo geral)
- 3 metodos privados (formatarDoce, formatarCliente, formatarVenda)

**Destaques para mencionar:**

a) **Queries parametrizadas ($1, $2, $3):**
> "Todas as queries usam parametros em vez de concatenar strings. Isso previne SQL injection."

```sql
-- Exemplo: buscar doce por ID
SELECT * FROM doces WHERE id = $1
-- O $1 e substituido pelo valor de forma segura
```

b) **UPDATE dinamico:**
> "Na atualizacao, so os campos que o usuario enviou sao atualizados. Se mandou so o nome, so muda o nome."

c) **Transacao no registrarVenda:**
> "A venda e a operacao mais complexa. Usa BEGIN/COMMIT/ROLLBACK. Primeiro verifica se o cliente existe, depois busca o doce COM TRAVA (FOR UPDATE), verifica o estoque, desconta, e so entao insere a venda. Se qualquer coisa der errado, faz ROLLBACK e nada muda."

d) **Mapeamento snake_case → camelCase:**
> "O banco usa snake_case (fabricado_em_mari, cliente_id), mas a API retorna em camelCase (fabricadoEmMari, clienteId). Os 3 helpers privados fazem essa conversao."

e) **NUMERIC retorna string:**
> "O PostgreSQL retorna NUMERIC como string, entao a gente usa parseFloat() nos helpers pra converter pra numero."

### 3. Rotas da API (1 min)

> "As rotas da API sao os endpoints que o frontend chama."

**Estrutura — 7 arquivos de rota:**

| Rota | Metodos | O que faz |
|------|---------|-----------|
| `/api/doces` | GET, POST | Listar/pesquisar doces + cadastrar novo |
| `/api/doces/[id]` | GET, PUT, DELETE | Buscar, atualizar ou remover um doce |
| `/api/clientes` | GET, POST | Listar/pesquisar clientes + cadastrar |
| `/api/clientes/[id]` | GET, PUT, DELETE | Buscar, atualizar ou remover um cliente |
| `/api/vendas` | GET, POST | Listar vendas + registrar nova venda |
| `/api/relatorio` | GET | Gerar resumo geral (5 metricas) |

**Tratamento de erros do banco:**
> "Quando o banco rejeita uma operacao, a API trata o erro e retorna mensagem clara."

- Erro `23503` (FK violation) → "Nao e possivel remover: tem vendas associadas" (status 400)
- Erro `23505` (UNIQUE violation) → "CPF ja cadastrado" (status 400)

---

## DEMO AO VIVO (~1 minuto)

> Abrir o sistema rodando (localhost:3303). Base ja deve estar populada.

### Roteiro da demo (escolher 3-4 acoes rapidas):

1. **Dashboard** — mostrar os contadores (5 doces, 3 clientes, valor em estoque)
2. **Cadastrar um doce novo** — ex: "Paçoca", Castanha, R$ 3.00, 35 unidades
   - Mostrar que apareceu na lista
3. **Registrar uma venda** — selecionar cliente, doce, quantidade
   - Mostrar que o estoque diminuiu
4. **Tentar deletar o doce que tem venda** — mostrar a mensagem de erro (FK RESTRICT)
5. **(Opcional) Tentar cadastrar cliente com CPF duplicado** — mostrar erro (UNIQUE)

> "Mesmo se recarregar a pagina ou reiniciar o servidor, os dados continuam la porque estao no PostgreSQL."

---

## PERGUNTAS QUE O PROFESSOR PODE FAZER

### Sobre o banco:

**P: Por que usaram NUMERIC em vez de FLOAT para preco?**
> "FLOAT tem problema de arredondamento. Por exemplo, 0.1 + 0.2 da 0.30000000000000004. NUMERIC armazena o valor exato, que e o certo pra dinheiro."

**P: O que acontece se tentar inserir um preco negativo?**
> "O banco rejeita por causa do CHECK (preco >= 0). A constraint nao deixa."

**P: Por que ON DELETE RESTRICT e nao CASCADE?**
> "Se fosse CASCADE, ao deletar um cliente, todas as vendas dele sumiriam junto. Com RESTRICT, o banco impede a delecao e avisa que tem vendas associadas. E mais seguro."

**P: Qual a diferenca entre SERIAL e IDENTITY?**
> "SERIAL cria uma sequence separada e usa ela como default. E o jeito mais comum no PostgreSQL. IDENTITY e mais recente (SQL standard), mas SERIAL funciona bem e e o que mais aparece em tutoriais."

**P: Por que VARCHAR e nao TEXT?**
> "VARCHAR com tamanho definido serve como documentacao e validacao — um nome nao pode ter 10 mil caracteres. TEXT nao tem limite."

### Sobre o codigo:

**P: O que e pool de conexoes?**
> "Em vez de abrir e fechar conexao toda hora (que e lento), o pool mantem ate 10 conexoes abertas e reutiliza. Quando o codigo pede uma conexao, pega do pool. Quando termina, devolve."

**P: O que e FOR UPDATE na venda?**
> "FOR UPDATE trava a linha do doce no banco enquanto a transacao acontece. Se duas vendas tentarem ao mesmo tempo, a segunda espera a primeira terminar. Isso evita vender mais do que tem em estoque."

**P: Por que todos os metodos sao async?**
> "Porque acessar o banco de dados e uma operacao de I/O — leva tempo. Async permite que o servidor continue atendendo outras requisicoes enquanto espera a resposta do banco."

**P: O que sao queries parametrizadas ($1, $2)?**
> "Em vez de colocar o valor direto na string SQL (que e perigoso — SQL injection), a gente passa os valores separados. A biblioteca cuida de escapar os caracteres especiais."

**P: Como funciona a transacao da venda?**
> "BEGIN inicia a transacao. Fazemos todas as operacoes. Se tudo deu certo, COMMIT salva tudo de uma vez. Se algo falhou, ROLLBACK desfaz tudo. E atomico — ou tudo acontece, ou nada acontece."

### Sobre a arquitetura:

**P: Por que nao usaram ORM (Prisma, Sequelize)?**
> "A disciplina e de Banco de Dados, entao faz mais sentido escrever SQL direto. Assim a gente mostra que entende as queries, as constraints e o funcionamento do banco."

**P: Onde ficam as regras de negocio?**
> "Parte fica no banco (constraints, FKs, CHECK) e parte fica no GerenciadorDoceria (transacao da venda, calculo do valor total). O banco garante a integridade, o codigo implementa a logica."

**P: Por que os nomes no banco sao diferentes do codigo?**
> "No banco usamos snake_case (fabricado_em_mari) que e o padrao do PostgreSQL. No codigo TypeScript usamos camelCase (fabricadoEmMari) que e o padrao do JavaScript. Os metodos formatarDoce, formatarCliente e formatarVenda fazem essa conversao."

---

## CHECKLIST PRE-APRESENTACAO

- [ ] Docker rodando: `docker compose ps` mostra `doceria-db` healthy
- [ ] Banco populado: acessar localhost:3303 e ver dados no dashboard
- [ ] Registrar pelo menos 2-3 vendas antes da apresentacao (pra ter dados no relatorio)
- [ ] Testar o fluxo completo: cadastrar → vender → tentar deletar (erro FK)
- [ ] Testar CPF duplicado: cadastrar cliente com CPF que ja existe
- [ ] DBeaver ou pgAdmin aberto (caso professor peca pra ver o banco direto)
- [ ] Terminal pronto para mostrar `docker compose ps` e `docker exec doceria-db psql ...` se pedir
- [ ] Conexao de internet estavel (apresentacao online)
- [ ] Compartilhamento de tela configurado

---

## COMANDOS UTEIS (caso precise no meio da apresentacao)

```bash
# Ver se o container ta rodando
docker compose ps

# Ver as tabelas do banco
docker exec doceria-db psql -U doceria -d doceria -c "\dt"

# Ver dados de uma tabela
docker exec doceria-db psql -U doceria -d doceria -c "SELECT * FROM doces;"
docker exec doceria-db psql -U doceria -d doceria -c "SELECT * FROM clientes;"
docker exec doceria-db psql -U doceria -d doceria -c "SELECT * FROM vendas;"

# Ver constraints de uma tabela
docker exec doceria-db psql -U doceria -d doceria -c "\d doces"
docker exec doceria-db psql -U doceria -d doceria -c "\d vendas"

# Iniciar o servidor web
cd ~/projects/Projeto_doceria_bd && npm run dev
```
