# Doceria Gourmet

Sistema web para gerenciamento de uma doceria. Permite cadastrar doces, clientes e vendedores, registrar vendas com desconto automatico, e gerar relatorios.

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + PostgreSQL 16

---

## Como Executar

Veja o guia completo em [`docs/public/COMO-RODAR.md`](docs/public/COMO-RODAR.md).

Resumo rapido:

```bash
npm install
docker compose up -d        # sobe o PostgreSQL
node scripts/migrate.mjs    # aplica migrations (se banco ja existia)
npm run dev
# acesse http://localhost:3303
```

---

## Paginas

| Pagina | Rota | Funcionalidade |
|--------|------|----------------|
| Inicio | `/` | Dashboard com cards de resumo + valor em estoque |
| Doces | `/doces` | CRUD completo com pesquisa, modal e detalhes |
| Clientes | `/clientes` | CRUD com mascaras de CPF/telefone e badges de desconto |
| Vendedores | `/vendedores` | CRUD de vendedores com mascaras de CPF/telefone |
| Vendas | `/vendas` | Registrar vendas com preview de desconto em tempo real |
| Relatorios | `/relatorios` | 3 secoes: Estoque, Clientes e Vendas |

---

## Banco de Dados

- **4 tabelas:** doces, clientes, vendedores, vendas
- **1 view:** `vw_clientes_com_desconto`
- **1 stored procedure:** `sp_registrar_venda` (desconto automatico, limite 15%)
- **3 indices:** FKs de vendas (cliente_id, doce_id, vendedor_id)
- **Constraints:** PK, FK (RESTRICT), UNIQUE (CPF), CHECK (preco, estoque, quantidade, pagamento)
- **Migrations:** `sql/migrations/` + `node scripts/migrate.mjs`

---

## Estrutura de Pastas

```text
Projeto_doceria_bd/
├── docker-compose.yml              # Container PostgreSQL 16 (porta 5433)
├── sql/
│   ├── init.sql                    # Schema + seed data
│   ├── views.sql                   # Views (referencia)
│   └── migrations/                 # Migrations sequenciais (001-005)
├── scripts/
│   └── migrate.mjs                 # Roda migrations pendentes
└── src/
    ├── models/                     # Entidades OOP
    │   ├── Doce.ts
    │   ├── Cliente.ts
    │   ├── Venda.ts
    │   └── Vendedor.ts
    ├── services/
    │   └── GerenciadorDoceria.ts   # Operacoes do sistema (SQL + stored procedure)
    ├── lib/
    │   ├── db.ts                   # Pool de conexao PostgreSQL
    │   ├── dados.ts                # Instancia do gerenciador
    │   ├── types.ts                # Interfaces (Doce, Cliente, Venda, Vendedor)
    │   └── utils.ts                # Helpers de formatacao (CPF, telefone, preco)
    ├── app/
    │   ├── api/                    # Endpoints REST
    │   │   ├── doces/              # GET + POST, [id] GET + PUT + DELETE
    │   │   ├── clientes/           # GET + POST, [id] GET + PUT + DELETE
    │   │   ├── vendedores/         # GET + POST, [id] DELETE + PATCH
    │   │   ├── vendas/             # GET + POST
    │   │   └── relatorio/          # GET
    │   ├── page.tsx                # Home (Dashboard)
    │   ├── doces/page.tsx
    │   ├── clientes/page.tsx
    │   ├── vendedores/page.tsx
    │   ├── vendas/page.tsx
    │   └── relatorios/page.tsx
    ├── components/
    │   ├── AppLayout.tsx
    │   ├── AppSidebar.tsx          # Menu com 6 itens
    │   └── ui/                     # Componentes shadcn/ui
    └── hooks/
        └── use-mobile.ts
```

---

## Diagrama de Classes UML

Documentacao completa com legenda e contagens em [`docs/public/DIAGRAMA-UML.md`](docs/public/DIAGRAMA-UML.md).

```mermaid
classDiagram

class Doce {
    -id: number
    -nome: string
    -categoria: string
    -preco: number
    -quantidadeEstoque: number
    -fabricadoEmMari: boolean
    +getId(): number
    +getNome(): string
    +getPreco(): number
    +getQuantidade(): number
    +setNome(novoNome): void
    +setPreco(novoPreco): void
    +toObject(): object
    +vender(quantidade): boolean
    +reabastecer(quantidade): void
}

class Cliente {
    -id: number
    -nome: string
    -cpf: string
    -email: string
    -telefone: string
    -torceFlamengo: boolean
    -assisteOnePiece: boolean
    -deSousa: boolean
    +getId(): number
    +getNome(): string
    +getCpf(): string
    +temDesconto(): boolean
    +toObject(): object
}

class Vendedor {
    -id: number
    -nome: string
    -cpf: string
    -email: string
    -telefone: string
    +getId(): number
    +getNome(): string
    +toObject(): object
}

class Venda {
    -id: number
    -clienteId: number
    -doceId: number
    -vendedorId: number
    -quantidade: number
    -valorTotal: number
    -formaPagamento: string
    -statusPagamento: string
    -dataVenda: string
    +getId(): number
    +getValorTotal(): number
    +toObject(): object
}

class GerenciadorDoceria {
    +listarDoces(): Promise
    +cadastrarDoce(...): Promise
    +atualizarDoce(id, dados): Promise
    +removerDoce(id): Promise
    +listarClientes(): Promise
    +cadastrarCliente(...): Promise
    +removerCliente(id): Promise
    +listarVendedores(): Promise
    +cadastrarVendedor(...): Promise
    +removerVendedor(id): Promise
    +registrarVenda(...): Promise
    +gerarRelatorio(): Promise
}

GerenciadorDoceria ..> Doce : consulta via SQL
GerenciadorDoceria ..> Cliente : consulta via SQL
GerenciadorDoceria ..> Venda : via stored procedure
GerenciadorDoceria ..> Vendedor : consulta via SQL
Venda "*" --> "1" Cliente : FK cliente_id
Venda "*" --> "1" Doce : FK doce_id
Venda "*" --> "1" Vendedor : FK vendedor_id
```

> Diagrama simplificado. Para o completo com todos os metodos, veja [`docs/public/DIAGRAMA-UML.md`](docs/public/DIAGRAMA-UML.md).

---

## Documentacao

| Documento | Caminho | Descricao |
|-----------|---------|-----------|
| Como Rodar | [`docs/public/COMO-RODAR.md`](docs/public/COMO-RODAR.md) | Guia para subir o projeto |
| Estado Atual | [`docs/public/ESTADO-ATUAL.md`](docs/public/ESTADO-ATUAL.md) | Visao geral atualizada do sistema |
| Diagrama UML | [`docs/public/DIAGRAMA-UML.md`](docs/public/DIAGRAMA-UML.md) | Diagrama de classes completo |
| Diagrama ER | [`docs/public/database/DIAGRAMA-ER.md`](docs/public/database/DIAGRAMA-ER.md) | Diagrama entidade-relacionamento |
| Esquema Relacional | [`docs/public/database/ESQUEMA-RELACIONAL.md`](docs/public/database/ESQUEMA-RELACIONAL.md) | Notacao formal das tabelas |
| Banco de Dados | [`docs/public/database/BANCO-DE-DADOS.md`](docs/public/database/BANCO-DE-DADOS.md) | Arquitetura e configuracao do PostgreSQL |
| Changelogs | [`docs/public/changelog/`](docs/public/changelog/) | Historico de mudancas |
