# Diagrama de Classes UML — Doceria Gourmet

> Diagrama atualizado com o estado atual do codigo. Sempre que uma classe mudar (novo atributo, novo metodo), atualizar aqui.

---

## Diagrama

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

## Legenda

| Simbolo | Significado |
|---------|-------------|
| `-` | Atributo `private` |
| `+` | Metodo `public` |
| `*--` | Composicao (o GerenciadorDoceria contem e gerencia o ciclo de vida) |
| `-->` | Associacao (Venda referencia por ID, sem posse) |

---

## Contagem de Membros

| Classe | Atributos | Metodos | Total |
|--------|-----------|---------|-------|
| Doce | 6 | 16 | 22 |
| Cliente | 8 | 17 | 25 |
| Venda | 6 | 8 | 14 |
| GerenciadorDoceria | 6 | 24 | 30 |
| **Total** | **26** | **65** | **91** |

---

## Relacionamentos

| Relacao | Tipo | Descricao |
|---------|------|-----------|
| GerenciadorDoceria → Doce | Composicao (1:N) | O gerenciador contem e controla o ciclo de vida dos doces |
| GerenciadorDoceria → Cliente | Composicao (1:N) | O gerenciador contem e controla o ciclo de vida dos clientes |
| GerenciadorDoceria → Venda | Composicao (1:N) | O gerenciador contem e controla o ciclo de vida das vendas |
| Venda → Cliente | Associacao (N:1) | Cada venda referencia um cliente pelo `clienteId` |
| Venda → Doce | Associacao (N:1) | Cada venda referencia um doce pelo `doceId` |
