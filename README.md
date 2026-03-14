# Doceria Gourmet 

## Estrutura de Arquivos

```text
bd/
├── src/
│   ├── models/           
│   │   ├── Cliente.ts
│   │   ├── Doce.ts
│   │   └── Venda.ts
│   ├── services/         
│   │   └── GerenciadorDoceria.ts
│   └── index.ts          
├── package.json          
├── tsconfig.json         
└── README.md
```

## Como Executar

1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. No diretório raiz (`bd/`), instale as dependências:
   ```bash
   npm install
   ```
3. Para rodar o projeto em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Para compilar e rodar a versão de produção:
   ```bash
   npm run build
   npm start
   ```
---
```mermaid
classDiagram

class Cliente {
    -id: number
    -nome: string
    -cpf: string
    -email: string
    +constructor(nome: string, cpf: string, email: string, id?: number)
    +getId(): number
    +getNome(): string
    +getCpf(): string
    +getEmail(): string
    +setNome(novoNome: string): void
    +setEmail(novoEmail: string): void
    +exibirDetalhes(): void
}

class Doce {
    -id: number
    -nome: string
    -categoria: string
    -preco: number
    -quantidadeEstoque: number
    +constructor(nome: string, categoria: string, preco: number, quantidade: number, id?: number)
    +getId(): number
    +getNome(): string
    +getCategoria(): string
    +getPreco(): number
    +getQuantidade(): number
    +setPreco(novoPreco: number): void
    +setQuantidade(novaQuantidade: number): void
    +exibirDetalhes(): void
    +aplicarDesconto(porcentagem: number): void
    +vender(quantidade: number): boolean
    +reabastecer(quantidade: number): void
}

class Venda {
    -id: number
    -clienteId: number
    -doceId: number
    -quantidade: number
    -valorTotal: number
    -dataVenda: string
    +constructor(clienteId: number, doceId: number, quantidade: number, valorTotal: number, dataVenda: string, id?: number)
    +getId(): number
    +getClienteId(): number
    +getDoceId(): number
    +getQuantidade(): number
    +getValorTotal(): number
    +getDataVenda(): string
    +exibirDetalhes(): void
}

class GerenciadorDoceria {
    -estoque: Doce[]
    -historicoVendas: Venda[]
    -clientes: Cliente[]
    -proximoId: number
    -proximaVendaId: number
    -proximoClienteId: number
    +constructor()
    +criarDoce(nome: string, categoria: string, preco: number, qtd: number): void
    +lerDoce(id: number): Doce | null
    +listarTodos(): void
    +atualizarDoce(id: number, novoPreco: number, novaQtd: number): boolean
    +deletarDoce(id: number): boolean
    +buscarPorCategoria(categoria: string): void
    +registrarVenda(clienteId: number, doceId: number, qtd: number, data: string): void
    +exibirRelatorioFinanceiro(): void
    +cadastrarCliente(nome: string, cpf: string, email: string): void
    +listarClientes(): void
    +buscarCliente(id: number): Cliente | null
}

GerenciadorDoceria "1" *-- "*" Doce : gerencia
GerenciadorDoceria "1" *-- "*" Cliente : gerencia
GerenciadorDoceria "1" *-- "*" Venda : registra

```
