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
    +listarDoces(): Promise~object[]~
    +buscarDocePorId(id: number): Promise~object~
    +buscarDocesPorNome(nome: string): Promise~object[]~
    +buscarDocesPorCategoria(categoria: string): Promise~object[]~
    +cadastrarDoce(nome, categoria, preco, quantidade, fabricadoEmMari?): Promise~object~
    +atualizarDoce(id: number, dados: object): Promise~object~
    +removerDoce(id: number): Promise~boolean~
    +contarDoces(): Promise~number~
    +calcularValorEstoque(): Promise~number~
    +listarClientes(): Promise~object[]~
    +buscarClientePorId(id: number): Promise~object~
    +buscarClientesPorNome(nome: string): Promise~object[]~
    +buscarClientePorCpf(cpf: string): Promise~object~
    +cadastrarCliente(nome, cpf, email, telefone, torceFlamengo?, assisteOnePiece?, deSousa?): Promise~object~
    +atualizarCliente(id: number, dados: object): Promise~object~
    +removerCliente(id: number): Promise~boolean~
    +contarClientes(): Promise~number~
    +listarVendas(): Promise~object[]~
    +buscarVendaPorId(id: number): Promise~object~
    +buscarVendasPorCliente(clienteId: number): Promise~object[]~
    +registrarVenda(clienteId, doceId, quantidade): Promise~object | string~
    +contarVendas(): Promise~number~
    +calcularTotalVendido(): Promise~number~
    +gerarRelatorio(): Promise~object~
    -formatarDoce(row: any): object
    -formatarCliente(row: any): object
    -formatarVenda(row: any): object
}

GerenciadorDoceria ..> Doce : consulta via SQL
GerenciadorDoceria ..> Cliente : consulta via SQL
GerenciadorDoceria ..> Venda : consulta via SQL
Venda "*" --> "1" Cliente : FK cliente_id
Venda "*" --> "1" Doce : FK doce_id
```

---

## Legenda

| Simbolo | Significado |
|---------|-------------|
| `-` | Atributo/metodo `private` |
| `+` | Metodo `public` |
| `..>` | Dependencia (GerenciadorDoceria consulta as tabelas via SQL) |
| `-->` | Associacao/FK (Venda referencia por ID) |

---

## Contagem de Membros

| Classe | Atributos | Metodos | Total |
|--------|-----------|---------|-------|
| Doce | 6 | 16 | 22 |
| Cliente | 8 | 17 | 25 |
| Venda | 6 | 8 | 14 |
| GerenciadorDoceria | 0 | 27 (24 publicos + 3 privados) | 27 |
| **Total** | **20** | **68** | **88** |

> **Nota:** O GerenciadorDoceria nao tem mais atributos (arrays/contadores). Os dados agora ficam no PostgreSQL. Os 3 metodos privados (`formatarDoce`, `formatarCliente`, `formatarVenda`) fazem o mapeamento `snake_case` → `camelCase`.

---

## Relacionamentos

| Relacao | Tipo | Descricao |
|---------|------|-----------|
| GerenciadorDoceria → Doce | Dependencia | O gerenciador consulta a tabela `doces` via SQL |
| GerenciadorDoceria → Cliente | Dependencia | O gerenciador consulta a tabela `clientes` via SQL |
| GerenciadorDoceria → Venda | Dependencia | O gerenciador consulta a tabela `vendas` via SQL |
| Venda → Cliente | FK (N:1) | `cliente_id` referencia `clientes(id)` com ON DELETE RESTRICT |
| Venda → Doce | FK (N:1) | `doce_id` referencia `doces(id)` com ON DELETE RESTRICT |
