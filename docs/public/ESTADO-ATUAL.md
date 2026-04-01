# Estado Atual do Projeto — Doceria Gourmet

> Este documento descreve o estado atual do sistema. Ele e atualizado sempre que algo muda no projeto, refletindo o que existe **agora** (nao o historico). Para ver o que mudou e quando, consulte a pasta `changelog/`.

---

## Visao Geral

O sistema Doceria Gourmet e uma aplicacao web para gerenciamento de uma doceria. Permite cadastrar doces, clientes e vendedores, registrar vendas com desconto automatico, e gerar relatorios de estoque, clientes e vendas.

**Stack atual:**
- Backend: Next.js 16 (API Routes) + TypeScript
- Frontend: React 19 + Tailwind CSS 4 + shadcn/ui
- Banco de dados: PostgreSQL 16 (Docker Compose, porta 5433)
- Conexao: biblioteca `pg` (node-postgres) com pool de conexoes
- OOP: classes de modelo mantidas no repositorio (avaliadas na Parte 1)

**Status:** funcional, Parte 2 em andamento. Persistencia em PostgreSQL com stored procedure e views.

---

## Entidades

O sistema possui 4 entidades principais:

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

### Cliente

Representa um cliente da doceria.

| Atributo | Tipo | Descricao |
|----------|------|-----------|
| id | number | Identificador unico (gerado automaticamente) |
| nome | string | Nome completo |
| cpf | string | CPF armazenado como somente digitos (11 digitos) |
| email | string | Email de contato |
| telefone | string | Telefone armazenado como somente digitos com DDI (13 digitos) |
| torceFlamengo | boolean | Se torce pro Flamengo (5% de desconto) |
| assisteOnePiece | boolean | Se assiste One Piece (5% de desconto) |
| deSousa | boolean | Se e da cidade de Sousa (5% de desconto) |

**Desconto:** cada flag ativa vale 5%, soma direta. Maximo 15% (3 flags).

### Vendedor

Representa um vendedor da doceria.

| Atributo | Tipo | Descricao |
|----------|------|-----------|
| id | number | Identificador unico (gerado automaticamente) |
| nome | string | Nome completo |
| cpf | string | CPF somente digitos (11 digitos) |
| email | string | Email de contato |
| telefone | string | Telefone somente digitos com DDI (13 digitos) |

### Venda

Representa uma venda realizada.

| Atributo | Tipo | Descricao |
|----------|------|-----------|
| id | number | Identificador unico (gerado automaticamente) |
| clienteId | number | ID do cliente que comprou |
| doceId | number | ID do doce vendido |
| vendedorId | number | ID do vendedor que efetivou |
| quantidade | number | Quantidade de unidades vendidas |
| valorTotal | number | Valor total com desconto aplicado |
| formaPagamento | string | cartao, boleto, pix, berries ou dinheiro |
| statusPagamento | string | confirmado, pendente ou recusado (pra pagamentos eletronicos) |
| dataVenda | string | Data da venda |

**Observacao:** o `valorTotal` e calculado automaticamente pela stored procedure, ja com desconto.

---

## GerenciadorDoceria

Classe central que gerencia todas as operacoes do sistema. Conecta no PostgreSQL via pool de conexoes e retorna objetos formatados (mapeamento `snake_case` → `camelCase`).

| Grupo | Metodos | Operacoes |
|-------|---------|-----------|
| Doces | 9 | listar, buscar por ID/nome/categoria, cadastrar, atualizar, remover, contar, calcular valor estoque |
| Clientes | 8 | listar, buscar por ID/nome/CPF, cadastrar, atualizar, remover, contar |
| Vendedores | 7 | listar, buscar por ID/nome, cadastrar, atualizar, remover, contar |
| Vendas | 6 | listar, buscar por ID/cliente, registrar (via stored procedure), contar, calcular total |
| Relatorios | 1 | gerar relatorio geral (queries em paralelo) |
| Helpers | 4 | formatarDoce, formatarCliente, formatarVenda, formatarVendedor (privados) |

**Normalizacao:** CPF e telefone sao normalizados (somente digitos) antes de salvar no banco.

**Venda via procedure:** `registrarVenda()` chama a stored procedure `sp_registrar_venda` que calcula desconto, valida estoque e insere a venda atomicamente.

---

## API REST

Todos os endpoints estao em `src/app/api/`.

### Doces (`/api/doces`)

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/doces` | Lista todos os doces |
| GET | `/api/doces?nome=X` | Pesquisa doces por nome |
| POST | `/api/doces` | Cadastra novo doce |
| GET | `/api/doces/[id]` | Retorna um doce especifico |
| PUT | `/api/doces/[id]` | Atualiza campos de um doce |
| DELETE | `/api/doces/[id]` | Remove um doce (erro se tem vendas) |

### Clientes (`/api/clientes`)

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/clientes` | Lista todos os clientes |
| GET | `/api/clientes?nome=X` | Pesquisa clientes por nome |
| POST | `/api/clientes` | Cadastra novo cliente (erro se CPF duplicado) |
| GET | `/api/clientes/[id]` | Retorna um cliente especifico |
| PUT | `/api/clientes/[id]` | Atualiza campos de um cliente |
| DELETE | `/api/clientes/[id]` | Remove um cliente (erro se tem vendas) |

### Vendedores (`/api/vendedores`)

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/vendedores` | Lista todos os vendedores |
| POST | `/api/vendedores` | Cadastra novo vendedor |
| DELETE | `/api/vendedores/[id]` | Remove um vendedor (erro se tem vendas) |
| PATCH | `/api/vendedores/[id]` | Atualiza campos de um vendedor |

### Vendas (`/api/vendas`)

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/vendas` | Lista todas as vendas |
| GET | `/api/vendas/[id]` | Retorna uma venda com seus itens |
| POST | `/api/vendas` | Registra nova venda com multiplos itens (via stored procedure) |

### Relatorio (`/api/relatorio`)

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/relatorio` | Retorna metricas gerais |

---

## Interface Web

### Paginas

O sistema possui duas areas separadas: **Cliente** e **Administrador**.
Na tela inicial (`/`) o usuario escolhe como quer acessar. Nao ha login — a separacao e apenas visual.

**Tela inicial:**

| Pagina | Rota | Funcionalidade |
|--------|------|----------------|
| Escolha de perfil | `/` | Dois cards: "Sou Cliente" e "Sou Administrador" |

**Area do Cliente (`/cliente/*`):**

| Pagina | Rota | Funcionalidade |
|--------|------|----------------|
| Catalogo | `/cliente` | Ver doces disponiveis com filtros + botao "Comprar" em cada card |
| Comprar | `/cliente/comprar` | Carrinho com multiplos doces, identificacao por CPF, cadastro rapido |
| Meus Dados | `/cliente/meus-dados` | Consultar dados cadastrais por CPF, cadastrar se nao existir |
| Minhas Compras | `/cliente/compras` | Historico de compras por CPF |

**Area do Admin (`/admin/*`):**

| Pagina | Rota | Funcionalidade |
|--------|------|----------------|
| Dashboard | `/admin` | Cards de resumo + valor em estoque |
| Doces | `/admin/doces` | CRUD com filtros (categoria, preco, estoque baixo) |
| Clientes | `/admin/clientes` | CRUD com mascaras CPF/telefone + detalhe com historico |
| Vendedores | `/admin/vendedores` | CRUD com mascaras CPF/telefone |
| Vendas | `/admin/vendas` | Registrar vendas com carrinho de multiplos doces + desconto |
| Relatorios | `/admin/relatorios` | Estoque, Clientes, Vendas e Vendas por Vendedor |

### Indicadores visuais

- **Estoque baixo**: badge vermelha quando < 5 unidades
- **Fabricado em Mari**: badge "Mari" ao lado do nome do doce
- **Desconto**: badge "Desconto" ao lado do nome do cliente
- **Resumo de venda**: card com valor bruto, desconto (%) e valor final em tempo real
- **Precos**: todos em formato brasileiro (R$ 4,50)
- **CPF**: exibido formatado (123.456.789-00) com mascara no input
- **Telefone**: exibido formatado (+55 (83) 99999-0001) com mascara no input
- **Vendas antigas**: campos inexistentes mostram "—" em vez de valores nulos

### Tratamento de erros

- Todas as paginas mostram toast de erro quando a API falha
- DELETE com FK RESTRICT: "Nao e possivel remover: tem vendas associadas"
- CPF duplicado: "CPF ja cadastrado"
- Pagamento recusado: "Pagamento recusado. A compra nao pode ser efetivada."
- Falha de conexao: "Erro ao conectar com o servidor"

---

## Regras de Negocio Ativas

| Regra | Descricao | Onde e verificada |
|-------|-----------|-------------------|
| Validacao de estoque | Venda so e registrada se houver estoque suficiente | Stored procedure `sp_registrar_venda` (FOR UPDATE) |
| Desconto automatico | 5% por flag ativa (flamengo, one piece, sousa), soma direta, limite maximo de 15% | Stored procedure consulta view `vw_clientes_com_desconto` |
| Cliente obrigatorio | O cliente precisa existir para registrar venda | Stored procedure |
| Doce obrigatorio | O doce precisa existir para registrar venda | Stored procedure |
| Vendedor obrigatorio | O vendedor precisa existir para registrar venda | Stored procedure |
| Forma de pagamento | Obrigatoria em toda venda (cartao, boleto, pix, berries, dinheiro) | CHECK constraint no banco |
| Status de pagamento | Obrigatorio para cartao/boleto/pix/berries (confirmado ou pendente) | Frontend + backend |
| Pagamento recusado | Venda nao e registrada se status for recusado | Stored procedure bloqueia |
| Multiplos itens | Uma venda pode conter varios doces diferentes | Tabela itens_venda |
| Identificacao na compra | Cliente se identifica por CPF na hora de comprar, ou cadastra na hora | Frontend area cliente |
| CPF unico | Nao pode cadastrar dois clientes/vendedores com mesmo CPF | UNIQUE constraint (erro 23505) |
| CPF imutavel | CPF nao pode ser alterado apos cadastro | Frontend (campo desabilitado) |
| CPF/telefone normalizado | Armazenados somente como digitos | Backend normaliza antes de salvar |
| Preco nao-negativo | Preco nao pode ser negativo | CHECK constraint (`preco >= 0`) |
| Integridade referencial | Nao pode deletar doce/cliente/vendedor com vendas | FK ON DELETE RESTRICT (erro 23503) |

---

## Persistencia de Dados

**Banco:** PostgreSQL 16 (Docker, porta 5433).

**Tabelas:** `doces`, `clientes`, `vendedores`, `vendas`, `itens_venda`, `migrations_executadas`

**Views:** `vw_clientes_com_desconto` — lista clientes elegiveis a desconto

**Stored Procedure:** `sp_registrar_venda` — registra venda com multiplos itens, desconto automatico (limite 15%), bloqueia pagamento recusado

**Indices:** `idx_vendas_cliente_id`, `idx_vendas_doce_id`, `idx_vendas_vendedor_id`, `idx_itens_venda_venda_id`, `idx_itens_venda_doce_id` (B-tree nas FKs)

**Constraints:** PK (SERIAL), FK (ON DELETE RESTRICT), UNIQUE (CPF), CHECK (preco, estoque, quantidade, forma_pagamento, status_pagamento)

**Migrations:** sistema de migrations sequenciais em `sql/migrations/`. Rodar com `node scripts/migrate.mjs`.

---

## Estrutura de Pastas

```
Projeto_doceria_bd/
├── docker-compose.yml             # Container PostgreSQL 16 (porta 5433)
├── sql/
│   ├── init.sql                   # Schema + seed data (executado no 1o start)
│   ├── views.sql                  # Views do banco (referencia)
│   └── migrations/                # Migrations sequenciais (001-007)
│       ├── 001_normalizar_cpf_telefone.sql
│       ├── ...
│       └── 007_bloquear_pagamento_recusado.sql
├── scripts/
│   └── migrate.mjs                # Roda migrations pendentes
├── .env.example                   # Template de credenciais
├── .env                           # Credenciais reais (gitignored)
└── src/
    ├── models/                    # Entidades OOP
    │   ├── Doce.ts
    │   ├── Cliente.ts
    │   ├── Venda.ts
    │   └── Vendedor.ts
    ├── services/
    │   └── GerenciadorDoceria.ts  # Operacoes do sistema (SQL + stored procedure)
    ├── lib/
    │   ├── db.ts                  # Pool de conexao PostgreSQL
    │   ├── dados.ts               # Instancia do gerenciador
    │   ├── types.ts               # Interfaces (Doce, Cliente, Venda, Vendedor)
    │   └── utils.ts               # Helpers de formatacao (CPF, telefone, preco)
    ├── app/
    │   ├── api/                   # Endpoints REST
    │   │   ├── doces/             # GET + POST, [id] GET + PUT + DELETE
    │   │   ├── clientes/          # GET + POST, [id] GET + PUT + DELETE
    │   │   ├── vendedores/        # GET + POST, [id] DELETE + PATCH
    │   │   ├── vendas/            # GET + POST, [id] GET (com itens)
    │   │   └── relatorio/         # GET
    │   ├── page.tsx               # Tela inicial (escolha Cliente/Admin)
    │   ├── admin/                 # Area administrativa
    │   │   ├── page.tsx           # Dashboard
    │   │   ├── doces/             # CRUD doces com filtros
    │   │   ├── clientes/          # CRUD clientes + detalhe [id]
    │   │   ├── vendedores/        # CRUD vendedores
    │   │   ├── vendas/            # Registrar vendas (carrinho)
    │   │   └── relatorios/        # Relatorios + vendas por vendedor
    │   └── cliente/               # Area do cliente
    │       ├── page.tsx           # Catalogo com compra rapida
    │       ├── comprar/           # Carrinho com identificacao
    │       ├── meus-dados/        # Consulta dados por CPF
    │       └── compras/           # Historico de compras
    ├── components/
    │   ├── AppLayout.tsx          # Wrapper com botao trocar perfil
    │   ├── AppSidebar.tsx         # Sidebar dinamica (admin/cliente)
    │   └── ui/                    # Componentes shadcn/ui
    └── hooks/
        └── use-mobile.ts
```

---

## Documentacao Disponivel

| Documento | Caminho | Descricao |
|-----------|---------|-----------|
| Estado Atual | `docs/public/ESTADO-ATUAL.md` | Este documento |
| Diagrama UML | `docs/public/DIAGRAMA-UML.md` | Diagrama de classes Mermaid |
| Diagrama ER | `docs/public/database/DIAGRAMA-ER.md` | Diagrama entidade-relacionamento |
| Esquema Relacional | `docs/public/database/ESQUEMA-RELACIONAL.md` | Notacao formal das tabelas |
| Banco de Dados | `docs/public/database/BANCO-DE-DADOS.md` | Arquitetura e configuracao do PostgreSQL |
| Como Rodar | `docs/public/COMO-RODAR.md` | Guia de setup |
| Changelogs | `docs/public/changelog/` | Historico de mudancas |
