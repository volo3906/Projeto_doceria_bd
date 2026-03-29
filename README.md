# Doceria Gourmet

Sistema web para gerenciamento de uma doceria. Permite cadastrar doces, clientes e registrar vendas, com relatorios de estoque, clientes e vendas.

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui

---

## Como Executar

Veja o guia completo em [`docs/public/COMO-RODAR.md`](docs/public/COMO-RODAR.md).

Resumo rapido:

```bash
npm install
npm run dev
# acesse http://localhost:3303
```

---

## Estrutura de Pastas

```text
src/
├── models/                        # Entidades OOP
│   ├── Doce.ts                    # 6 atributos, 16 metodos
│   ├── Cliente.ts                 # 8 atributos, 17 metodos
│   └── Venda.ts                   # 6 atributos, 8 metodos
├── services/
│   └── GerenciadorDoceria.ts      # 24 metodos, gerencia todo o CRUD
├── lib/
│   ├── dados.ts                   # Singleton do gerenciador (globalThis)
│   ├── types.ts                   # Interfaces TypeScript
│   └── utils.ts                   # Funcao cn() para classes CSS
├── app/
│   ├── api/                       # 7 endpoints REST
│   │   ├── doces/route.ts         # GET + POST
│   │   ├── doces/[id]/route.ts    # GET + PUT + DELETE
│   │   ├── clientes/route.ts      # GET + POST
│   │   ├── clientes/[id]/route.ts # GET + PUT + DELETE
│   │   ├── vendas/route.ts        # GET + POST
│   │   └── relatorio/route.ts     # GET
│   ├── page.tsx                   # Home (Dashboard)
│   ├── doces/page.tsx             # Pagina de Doces
│   ├── clientes/page.tsx          # Pagina de Clientes
│   ├── vendas/page.tsx            # Pagina de Vendas
│   ├── relatorios/page.tsx        # Pagina de Relatorios
│   ├── layout.tsx                 # Layout raiz
│   └── globals.css                # Tema rosa/pink
├── components/
│   ├── AppLayout.tsx              # Wrapper com sidebar
│   ├── AppSidebar.tsx             # Menu lateral de navegacao
│   └── ui/                        # 16 componentes shadcn/ui
└── hooks/
    └── use-mobile.ts              # Detecta tela mobile
```

---

## Paginas

| Pagina | Rota | Funcionalidade |
|--------|------|----------------|
| Inicio | `/` | Dashboard com cards de resumo + valor em estoque |
| Doces | `/doces` | CRUD completo com pesquisa, modal e detalhes |
| Clientes | `/clientes` | CRUD completo com checkboxes de desconto |
| Vendas | `/vendas` | Registrar vendas e ver historico |
| Relatorios | `/relatorios` | 3 secoes: Estoque, Clientes e Vendas |

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
    +constructor(nome, categoria, preco, quantidade, fabricadoEmMari?, id?)
    +getId(): number
    +getNome(): string
    +getCategoria(): string
    +getPreco(): number
    +getQuantidade(): number
    +getFabricadoEmMari(): boolean
    +setNome(novoNome: string): void
    +setCategoria(novaCategoria: string): void
    +setPreco(novoPreco: number): void
    +setQuantidade(novaQuantidade: number): void
    +setFabricadoEmMari(valor: boolean): void
    +toObject(): object
    +exibirDetalhes(): void
    +aplicarDesconto(porcentagem: number): void
    +vender(quantidade: number): boolean
    +reabastecer(quantidade: number): void
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
    +constructor(nome, cpf, email, telefone, torceFlamengo?, assisteOnePiece?, deSousa?, id?)
    +getId(): number
    +getNome(): string
    +getCpf(): string
    +getEmail(): string
    +getTelefone(): string
    +getTorceFlamengo(): boolean
    +getAssisteOnePiece(): boolean
    +getDeSousa(): boolean
    +setNome(novoNome: string): void
    +setEmail(novoEmail: string): void
    +setTelefone(novoTelefone: string): void
    +setTorceFlamengo(valor: boolean): void
    +setAssisteOnePiece(valor: boolean): void
    +setDeSousa(valor: boolean): void
    +temDesconto(): boolean
    +toObject(): object
    +exibirDetalhes(): void
}

class Venda {
    -id: number
    -clienteId: number
    -doceId: number
    -quantidade: number
    -valorTotal: number
    -dataVenda: string
    +constructor(clienteId, doceId, quantidade, valorTotal, dataVenda, id?)
    +getId(): number
    +getClienteId(): number
    +getDoceId(): number
    +getQuantidade(): number
    +getValorTotal(): number
    +getDataVenda(): string
    +toObject(): object
    +exibirDetalhes(): void
}

class GerenciadorDoceria {
    -estoque: Doce[]
    -clientes: Cliente[]
    -historicoVendas: Venda[]
    -proximoDoceId: number
    -proximoClienteId: number
    -proximoVendaId: number
    +listarDoces(): object[]
    +buscarDocePorId(id: number): Doce
    +buscarDocesPorNome(nome: string): object[]
    +buscarDocesPorCategoria(categoria: string): object[]
    +cadastrarDoce(nome, categoria, preco, quantidade, fabricadoEmMari?): object
    +atualizarDoce(id: number, dados: object): object
    +removerDoce(id: number): boolean
    +contarDoces(): number
    +calcularValorEstoque(): number
    +listarClientes(): object[]
    +buscarClientePorId(id: number): Cliente
    +buscarClientesPorNome(nome: string): object[]
    +buscarClientePorCpf(cpf: string): Cliente
    +cadastrarCliente(nome, cpf, email, telefone, torceFlamengo?, assisteOnePiece?, deSousa?): object
    +atualizarCliente(id: number, dados: object): object
    +removerCliente(id: number): boolean
    +contarClientes(): number
    +listarVendas(): object[]
    +buscarVendaPorId(id: number): Venda
    +buscarVendasPorCliente(clienteId: number): object[]
    +registrarVenda(clienteId, doceId, quantidade): object | string
    +contarVendas(): number
    +calcularTotalVendido(): number
    +gerarRelatorio(): object
}

GerenciadorDoceria "1" *-- "*" Doce : gerencia
GerenciadorDoceria "1" *-- "*" Cliente : gerencia
GerenciadorDoceria "1" *-- "*" Venda : registra
Venda "*" --> "1" Cliente : referencia clienteId
Venda "*" --> "1" Doce : referencia doceId
```

---

## Documentacao

| Documento | Caminho | Descricao |
|-----------|---------|-----------|
| Como Rodar | [`docs/public/COMO-RODAR.md`](docs/public/COMO-RODAR.md) | Guia para subir o projeto localmente |
| Estado Atual | [`docs/public/ESTADO-ATUAL.md`](docs/public/ESTADO-ATUAL.md) | Visao geral atualizada do sistema |
| Diagrama UML | [`docs/public/DIAGRAMA-UML.md`](docs/public/DIAGRAMA-UML.md) | Diagrama de classes com legenda e contagens |
| Changelogs | [`docs/public/changelog/`](docs/public/changelog/) | Historico de mudancas |
