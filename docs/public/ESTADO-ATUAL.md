# Estado Atual do Projeto — Doceria Gourmet

> Este documento descreve o estado atual do sistema. Ele e atualizado sempre que algo muda no projeto, refletindo o que existe **agora** (nao o historico). Para ver o que mudou e quando, consulte a pasta `changelog/`.

---

## Visao Geral

O sistema Doceria Gourmet e uma aplicacao web para gerenciamento de uma doceria. Permite cadastrar doces, clientes e registrar vendas, com relatorios de estoque, clientes e vendas.

**Stack atual:**
- Backend: Next.js 16 (API Routes) + TypeScript
- Frontend: React 19 + Tailwind CSS 4 + shadcn/ui
- Banco de dados: PostgreSQL 16 (Docker Compose, porta 5433)
- Conexao: biblioteca `pg` (node-postgres) com pool de conexoes
- OOP: classes de modelo mantidas no repositorio (avaliadas na Parte 1)

**Status:** funcional, com persistencia em PostgreSQL.

---

## Entidades

O sistema possui 3 entidades principais, cada uma representada por uma classe OOP:

### Doce

Representa um produto da doceria.

| Atributo | Tipo | Descricao |
|----------|------|-----------|
| id | number | Identificador unico (gerado automaticamente) |
| nome | string | Nome do doce (ex: "Brigadeiro") |
| categoria | string | Categoria do doce (ex: "Chocolate", "Coco") |
| preco | number | Preco unitario em reais |
| quantidadeEstoque | number | Unidades disponiveis em estoque |
| fabricadoEmMari | boolean | Se o doce foi fabricado na cidade de Mari |

**Metodos de negocio:**
- `vender(quantidade)` — verifica se ha estoque suficiente e desconta. Retorna `true` se a venda foi possivel, `false` se nao
- `reabastecer(quantidade)` — adiciona unidades ao estoque
- `aplicarDesconto(porcentagem)` — reduz o preco pela porcentagem informada
- `toObject()` — converte para objeto simples para a API (mapeia `quantidadeEstoque` para `estoque`)

### Cliente

Representa um cliente da doceria.

| Atributo | Tipo | Descricao |
|----------|------|-----------|
| id | number | Identificador unico (gerado automaticamente) |
| nome | string | Nome completo |
| cpf | string | CPF (nao pode ser alterado apos o cadastro) |
| email | string | Email de contato |
| telefone | string | Telefone de contato |
| torceFlamengo | boolean | Se o cliente torce pro Flamengo (criterio de desconto) |
| assisteOnePiece | boolean | Se o cliente assiste One Piece (criterio de desconto) |
| deSousa | boolean | Se o cliente e da cidade de Sousa (criterio de desconto) |

**Metodos de negocio:**
- `temDesconto()` — retorna `true` se qualquer uma das 3 flags booleanas for verdadeira

### Venda

Representa uma venda realizada.

| Atributo | Tipo | Descricao |
|----------|------|-----------|
| id | number | Identificador unico (gerado automaticamente) |
| clienteId | number | ID do cliente que comprou |
| doceId | number | ID do doce vendido |
| quantidade | number | Quantidade de unidades vendidas |
| valorTotal | number | Valor total da venda (preco * quantidade) |
| dataVenda | string | Data da venda no formato dd/mm/aaaa |

**Observacao:** o `valorTotal` e a `dataVenda` sao calculados automaticamente no momento do registro da venda.

---

## GerenciadorDoceria

Classe central que gerencia todas as operacoes do sistema. Conecta no PostgreSQL via pool de conexoes e retorna objetos formatados (mapeamento `snake_case` → `camelCase`).

**Total de metodos:** 24 (todos `async`) + 3 helpers privados

| Grupo | Metodos | Operacoes |
|-------|---------|-----------|
| Doces | 9 | listar, buscar por ID, buscar por nome, buscar por categoria, cadastrar, atualizar, remover, contar, calcular valor estoque |
| Clientes | 8 | listar, buscar por ID, buscar por nome, buscar por CPF, cadastrar, atualizar, remover, contar |
| Vendas | 6 | listar, buscar por ID, buscar por cliente, registrar (com transacao), contar, calcular total vendido |
| Relatorios | 1 | gerar relatorio geral (totais + valores, queries em paralelo) |
| Helpers | 3 | formatarDoce, formatarCliente, formatarVenda (privados) |

**Instancia unica:** `src/lib/dados.ts` exporta uma instancia do gerenciador. A classe agora e stateless (dados no banco), entao nao precisa mais do `globalThis`.

---

## API REST

Todos os endpoints estao em `src/app/api/`.

### Doces (`/api/doces`)

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/doces` | Lista todos os doces |
| GET | `/api/doces?nome=X` | Pesquisa doces por nome (busca parcial, case-insensitive) |
| POST | `/api/doces` | Cadastra novo doce |
| GET | `/api/doces/[id]` | Retorna um doce especifico |
| PUT | `/api/doces/[id]` | Atualiza campos de um doce |
| DELETE | `/api/doces/[id]` | Remove um doce |

### Clientes (`/api/clientes`)

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/clientes` | Lista todos os clientes |
| GET | `/api/clientes?nome=X` | Pesquisa clientes por nome |
| POST | `/api/clientes` | Cadastra novo cliente |
| GET | `/api/clientes/[id]` | Retorna um cliente especifico |
| PUT | `/api/clientes/[id]` | Atualiza campos de um cliente |
| DELETE | `/api/clientes/[id]` | Remove um cliente |

### Vendas (`/api/vendas`)

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/vendas` | Lista todas as vendas |
| POST | `/api/vendas` | Registra nova venda (valida cliente, doce e estoque) |

### Relatorio (`/api/relatorio`)

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/relatorio` | Retorna metricas gerais (totais de doces, clientes, vendas, valores) |

---

## Interface Web

### Paginas

| Pagina | Rota | Funcionalidade |
|--------|------|----------------|
| Home | `/` | Dashboard com 4 cards de resumo + valor em estoque |
| Doces | `/doces` | CRUD completo: tabela, pesquisa, criar/editar via modal, visualizar detalhes, remover |
| Clientes | `/clientes` | CRUD completo: tabela, pesquisa, criar/editar via modal com checkboxes de desconto, visualizar detalhes, remover |
| Vendas | `/vendas` | Registrar vendas (selecionar cliente + doce + quantidade) e ver historico |
| Relatorios | `/relatorios` | 3 secoes separadas: Estoque, Clientes e Vendas, cada uma com cards de resumo + tabela detalhada |

### Indicadores visuais

- **Estoque baixo**: quando um doce tem menos de 5 unidades, o estoque aparece com badge vermelha
- **Fabricado em Mari**: doces fabricados em Mari mostram uma badge "Mari" ao lado do nome
- **Desconto**: clientes com qualquer flag de desconto ativa mostram uma badge "Desconto" ao lado do nome
- **Total arrecadado**: valor em destaque verde na secao de vendas do relatorio

### Componentes

O sistema usa 16 componentes da biblioteca shadcn/ui (badge, button, card, dialog, dropdown-menu, input, label, select, separator, sheet, sidebar, skeleton, sonner, table, textarea, tooltip) alem de 2 componentes proprios (AppLayout e AppSidebar).

---

## Regras de Negocio Ativas

| Regra | Descricao | Onde e verificada |
|-------|-----------|-------------------|
| Validacao de estoque | Uma venda so e registrada se houver estoque suficiente | `GerenciadorDoceria.registrarVenda()` (transacao com FOR UPDATE) |
| Cliente obrigatorio na venda | O cliente precisa existir para registrar uma venda | `GerenciadorDoceria.registrarVenda()` |
| Doce obrigatorio na venda | O doce precisa existir para registrar uma venda | `GerenciadorDoceria.registrarVenda()` |
| Campos obrigatorios | Doce: nome, categoria, preco, estoque. Cliente: nome, cpf, email, telefone | API routes (POST) + constraints NOT NULL no banco |
| CPF unico | Nao pode cadastrar dois clientes com o mesmo CPF | Constraint UNIQUE no banco (erro 23505) |
| CPF imutavel | O CPF de um cliente nao pode ser alterado depois do cadastro | Frontend (campo desabilitado na edicao) |
| Preco nao-negativo | O preco nao pode ser negativo | CHECK constraint no banco (`preco >= 0`) |
| Quantidade nao-negativa | O estoque nao pode ser negativo | CHECK constraint no banco (`estoque >= 0`) |
| Integridade referencial | Nao e possivel deletar um doce ou cliente que tem vendas | FK com ON DELETE RESTRICT (erro 23503) |

---

## Persistencia de Dados

**Situacao atual:** os dados sao persistidos em PostgreSQL 16. O banco roda em um container Docker (porta 5433) e os dados sobrevivem a reinicializacoes do servidor e do container.

**Detalhes:**
- 3 tabelas: `doces`, `clientes`, `vendas`
- IDs gerados pelo banco (`SERIAL`)
- Constraints de integridade: PK, FK (ON DELETE RESTRICT), UNIQUE (CPF), CHECK (preco, estoque, quantidade)
- Seed data: 5 doces e 3 clientes inseridos automaticamente na criacao do banco
- Documentacao completa do banco: `docs/public/database/BANCO-DE-DADOS.md`

---

## Estrutura de Pastas

```
Projeto_doceria_bd/
├── docker-compose.yml             # Container PostgreSQL 16 (porta 5433)
├── sql/
│   └── init.sql                   # Schema + seed data (executado no 1o start)
├── .env.example                   # Template de credenciais (commitado)
├── .env                           # Credenciais reais (gitignored)
└── src/
    ├── models/                    # Entidades OOP (mantidas da Parte 1)
    │   ├── Doce.ts                # 6 atributos, 16 metodos
    │   ├── Cliente.ts             # 8 atributos, 17 metodos
    │   └── Venda.ts               # 6 atributos, 8 metodos
    ├── services/
    │   └── GerenciadorDoceria.ts  # 24 metodos async + 3 helpers (SQL queries)
    ├── lib/
    │   ├── db.ts                  # Pool de conexao PostgreSQL (pg)
    │   ├── dados.ts               # Instancia do gerenciador
    │   ├── types.ts               # Interfaces TypeScript (Doce, Cliente, Venda)
    │   └── utils.ts               # Funcao cn() para classes CSS
    ├── app/
    │   ├── api/                   # 7 endpoints REST
    │   │   ├── doces/route.ts     # GET + POST
    │   │   ├── doces/[id]/route.ts    # GET + PUT + DELETE
    │   │   ├── clientes/route.ts      # GET + POST
    │   │   ├── clientes/[id]/route.ts # GET + PUT + DELETE
    │   │   ├── vendas/route.ts        # GET + POST
    │   │   └── relatorio/route.ts     # GET
    │   ├── page.tsx               # Home (Dashboard)
    │   ├── doces/page.tsx         # Pagina de Doces
    │   ├── clientes/page.tsx      # Pagina de Clientes
    │   ├── vendas/page.tsx        # Pagina de Vendas
    │   ├── relatorios/page.tsx    # Pagina de Relatorios
    │   ├── layout.tsx             # Layout raiz (fonte Inter)
    │   └── globals.css            # Tema rosa/pink (hue 350)
    ├── components/
    │   ├── AppLayout.tsx          # Wrapper com sidebar + sonner
    │   ├── AppSidebar.tsx         # Menu lateral de navegacao
    │   └── ui/                    # 16 componentes shadcn/ui
    └── hooks/
        └── use-mobile.ts          # Detecta tela mobile
```

---

## Documentacao Disponivel

| Documento | Caminho | Descricao |
|-----------|---------|-----------|
| Estado Atual | `docs/public/ESTADO-ATUAL.md` | Este documento — visao geral atualizada do projeto |
| Diagrama UML | `docs/public/DIAGRAMA-UML.md` | Diagrama de classes com legenda, contagens e relacionamentos |
| Banco de Dados | `docs/public/database/BANCO-DE-DADOS.md` | Arquitetura, schema, constraints e configuracao do PostgreSQL |
| Como Rodar | `docs/public/COMO-RODAR.md` | Guia passo a passo para rodar o projeto localmente |
| Changelogs | `docs/public/changelog/` | Historico de mudancas com datas |
