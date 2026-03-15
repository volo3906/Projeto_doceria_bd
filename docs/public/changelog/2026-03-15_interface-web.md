# Changelog — Interface Web (15/03/2026)

Documento detalhando todas as mudancas realizadas para transformar o projeto console em aplicacao web.

---

## Resumo Geral

O projeto partiu de uma aplicacao console (terminal) com classes OOP em TypeScript e foi transformado em uma **aplicacao web completa** usando Next.js, mantendo toda a logica orientada a objetos original. As classes `Doce`, `Cliente` e `Venda` continuam sendo usadas internamente — a interface web se comunica com elas atraves de uma API REST.

### O que existia antes

- Aplicacao de terminal (`src/index.ts`) com menu interativo via `readline`
- 3 classes OOP: `Doce`, `Cliente`, `Venda` (com atributos `private` e getters/setters)
- 1 classe gerenciadora: `GerenciadorDoceria` com metodos CRUD basicos
- Dependencias: apenas `typescript` e `ts-node`
- Execucao: `ts-node src/index.ts`

### O que existe agora

- Aplicacao web completa com interface grafica (Next.js + React)
- As mesmas 3 classes OOP, agora ampliadas com novos atributos e metodos
- GerenciadorDoceria reescrito com ~22 metodos (antes ~10)
- API REST com 7 endpoints cobrindo todo o CRUD
- 5 paginas na interface: Home, Doces, Clientes, Vendas, Relatorios
- Componentes de UI reutilizaveis (shadcn/ui)

---

## 1. Mudancas nos Models (classes OOP)

### 1.1 Doce (`src/models/Doce.ts`)

**Atributos adicionados:**
- `fabricadoEmMari: boolean` — indica se o doce foi fabricado na cidade de Mari. Recebe `false` como valor padrao no constructor

**Metodos adicionados:**
- `setNome(novoNome: string): void` — permite alterar o nome do doce (necessario para a operacao de atualizacao via API)
- `setCategoria(novaCategoria: string): void` — permite alterar a categoria
- `getFabricadoEmMari(): boolean` — getter para o novo atributo
- `setFabricadoEmMari(valor: boolean): void` — setter para o novo atributo
- `toObject()` — retorna um objeto JavaScript simples com todos os atributos. Esse metodo e fundamental para a integracao com a API: como os atributos da classe sao `private`, o `JSON.stringify()` nao conseguiria acessa-los diretamente. Alem disso, o `toObject()` faz o mapeamento de `quantidadeEstoque` para `estoque`, que e o nome usado na interface

**Metodos mantidos sem alteracao:**
- `getId()`, `getNome()`, `getCategoria()`, `getPreco()`, `getQuantidade()`
- `setPreco()`, `setQuantidade()`
- `exibirDetalhes()`, `aplicarDesconto()`, `vender()`, `reabastecer()`

**Mudanca no constructor:**
```
// Antes:
constructor(nome, categoria, preco, quantidade, id?)

// Agora:
constructor(nome, categoria, preco, quantidade, fabricadoEmMari = false, id?)
```
O parametro `fabricadoEmMari` foi inserido antes do `id` para manter o `id` como ultimo parametro opcional.

---

### 1.2 Cliente (`src/models/Cliente.ts`)

**Atributos adicionados:**
- `telefone: string` — numero de telefone do cliente (campo obrigatorio)
- `torceFlamengo: boolean` — indica se o cliente torce pro Flamengo (criterio de desconto)
- `assisteOnePiece: boolean` — indica se o cliente assiste One Piece (criterio de desconto)
- `deSousa: boolean` — indica se o cliente e da cidade de Sousa (criterio de desconto)

Os tres campos booleanos recebem `false` como valor padrao no constructor.

**Metodos adicionados:**
- `getTelefone(): string` / `setTelefone(novoTelefone: string): void`
- `getTorceFlamengo(): boolean` / `setTorceFlamengo(valor: boolean): void`
- `getAssisteOnePiece(): boolean` / `setAssisteOnePiece(valor: boolean): void`
- `getDeSousa(): boolean` / `setDeSousa(valor: boolean): void`
- `temDesconto(): boolean` — retorna `true` se qualquer um dos tres campos booleanos for verdadeiro. Centraliza a logica de verificacao de desconto
- `toObject()` — retorna objeto simples com todos os 8 atributos (id, nome, cpf, email, telefone, torceFlamengo, assisteOnePiece, deSousa)

**Metodos mantidos sem alteracao:**
- `getId()`, `getNome()`, `getCpf()`, `getEmail()`
- `setNome()`, `setEmail()`
- `exibirDetalhes()` (atualizado para incluir telefone na saida)

**Mudanca no constructor:**
```
// Antes:
constructor(nome, cpf, email, id?)

// Agora:
constructor(nome, cpf, email, telefone, torceFlamengo = false, assisteOnePiece = false, deSousa = false, id?)
```

---

### 1.3 Venda (`src/models/Venda.ts`)

**Metodos adicionados:**
- `toObject()` — retorna objeto simples com os 6 atributos (id, clienteId, doceId, quantidade, valorTotal, dataVenda)

**Nenhum atributo novo.** A classe Venda ja possuia todos os campos necessarios. A unica adicao foi o `toObject()` para integracao com a API.

---

## 2. GerenciadorDoceria (`src/services/GerenciadorDoceria.ts`)

A classe foi completamente reescrita para suportar a interface web, mantendo o mesmo principio: ela instancia e gerencia objetos das classes `Doce`, `Cliente` e `Venda` internamente.

### Principio de funcionamento

- **Internamente**: trabalha com instancias das classes OOP (`new Doce(...)`, `doce.vender()`, `doce.getNome()`)
- **Externamente**: retorna objetos simples (plain objects) via `.toObject()` para que as API routes consigam serializar em JSON

### Metodos por secao

#### Doces (10 metodos)

| Metodo | Descricao | Status |
|--------|-----------|--------|
| `listarDoces()` | Retorna todos os doces como array de objetos | Novo |
| `buscarDocePorId(id)` | Retorna a instancia da classe Doce (ou null) | Novo |
| `buscarDocesPorNome(nome)` | Pesquisa por nome (case-insensitive, busca parcial) | Novo |
| `buscarDocesPorCategoria(cat)` | Filtra por categoria exata | Adaptado (antes era `buscarPorCategoria`, imprimia no console) |
| `cadastrarDoce(nome, cat, preco, qtd, fabricadoEmMari)` | Cria novo doce e retorna o objeto | Adaptado (antes era `criarDoce`, imprimia no console) |
| `atualizarDoce(id, dados)` | Atualiza campos parcialmente | Reescrito (antes so aceitava preco + qtd, agora aceita qualquer campo) |
| `removerDoce(id)` | Remove do array por ID | Adaptado (antes era `deletarDoce`, imprimia no console) |
| `contarDoces()` | Retorna total de doces no estoque | Novo |
| `calcularValorEstoque()` | Soma preco * quantidade de todos os doces | Novo (antes essa logica existia dentro de `exibirRelatorioFinanceiro`) |

#### Clientes (8 metodos)

| Metodo | Descricao | Status |
|--------|-----------|--------|
| `listarClientes()` | Retorna todos os clientes como array de objetos | Adaptado (antes era `listarClientes` com `console.log`) |
| `buscarClientePorId(id)` | Retorna instancia da classe Cliente (ou null) | Adaptado (antes era `buscarCliente`) |
| `buscarClientesPorNome(nome)` | Pesquisa por nome (case-insensitive, parcial) | Novo |
| `buscarClientePorCpf(cpf)` | Busca por CPF exato | Novo |
| `cadastrarCliente(nome, cpf, email, tel, ...)` | Cria novo cliente com todos os campos | Adaptado (antes nao tinha telefone nem campos de desconto) |
| `atualizarCliente(id, dados)` | Atualiza campos parcialmente | Novo (antes nao existia atualizacao de cliente) |
| `removerCliente(id)` | Remove do array por ID | Novo (antes nao existia remocao de cliente) |
| `contarClientes()` | Retorna total de clientes | Novo |

#### Vendas (6 metodos)

| Metodo | Descricao | Status |
|--------|-----------|--------|
| `listarVendas()` | Retorna todas as vendas como array de objetos | Novo |
| `buscarVendaPorId(id)` | Retorna instancia da classe Venda (ou null) | Novo |
| `buscarVendasPorCliente(clienteId)` | Filtra vendas por cliente | Novo |
| `registrarVenda(clienteId, doceId, qtd)` | Valida cliente, doce e estoque; registra venda | Adaptado (agora retorna o objeto da venda ou mensagem de erro em vez de imprimir no console; a data e gerada automaticamente) |
| `contarVendas()` | Retorna total de vendas | Novo |
| `calcularTotalVendido()` | Soma valorTotal de todas as vendas | Novo |

#### Relatorios (1 metodo)

| Metodo | Descricao | Status |
|--------|-----------|--------|
| `gerarRelatorio()` | Retorna um objeto com metricas gerais (totais + valores) | Adaptado (antes era `exibirRelatorioFinanceiro` com `console.log`) |

### Diferenca principal em relacao a versao anterior

Na versao console, os metodos faziam `console.log()` diretamente e retornavam `void`. Agora, todos os metodos retornam dados (objetos ou arrays) para que a API possa transformar em JSON e enviar ao frontend. A logica de negocio (validacao de estoque, calculo de valor total) permanece identica.

---

## 3. Singleton (`src/lib/dados.ts`)

Arquivo novo que exporta uma unica instancia do `GerenciadorDoceria`. Utiliza o padrao `globalThis` para preservar os dados entre recarregamentos automaticos do Next.js durante o desenvolvimento (hot reload).

```typescript
const g = globalThis as any;
if (!g.gerenciador) {
  g.gerenciador = new GerenciadorDoceria();
}
const gerenciador: GerenciadorDoceria = g.gerenciador;
export default gerenciador;
```

Sem isso, cada vez que o Next.js recarrega um modulo em modo de desenvolvimento, uma nova instancia do gerenciador seria criada, perdendo todos os dados em memoria.

---

## 4. API REST

Todas as rotas ficam em `src/app/api/`. Usam o App Router do Next.js (route handlers).

### 4.1 Doces

| Metodo HTTP | Rota | Funcao |
|-------------|------|--------|
| GET | `/api/doces` | Lista todos os doces |
| GET | `/api/doces?nome=X` | Pesquisa doces por nome |
| POST | `/api/doces` | Cadastra novo doce |
| GET | `/api/doces/[id]` | Busca um doce especifico por ID |
| PUT | `/api/doces/[id]` | Atualiza campos de um doce |
| DELETE | `/api/doces/[id]` | Remove um doce |

**Body do POST/PUT:**
```json
{
  "nome": "Brigadeiro",
  "categoria": "Chocolate",
  "preco": 4.00,
  "estoque": 50,
  "fabricadoEmMari": false
}
```

**Validacao:** POST retorna 400 se `nome`, `categoria`, `preco` ou `estoque` estiverem ausentes.

### 4.2 Clientes

| Metodo HTTP | Rota | Funcao |
|-------------|------|--------|
| GET | `/api/clientes` | Lista todos os clientes |
| GET | `/api/clientes?nome=X` | Pesquisa clientes por nome |
| POST | `/api/clientes` | Cadastra novo cliente |
| GET | `/api/clientes/[id]` | Busca um cliente especifico |
| PUT | `/api/clientes/[id]` | Atualiza campos de um cliente |
| DELETE | `/api/clientes/[id]` | Remove um cliente |

**Body do POST:**
```json
{
  "nome": "Joao Silva",
  "cpf": "123.456.789-00",
  "email": "joao@email.com",
  "telefone": "(83) 99999-0001",
  "torceFlamengo": true,
  "assisteOnePiece": false,
  "deSousa": false
}
```

**Validacao:** POST retorna 400 se `nome`, `cpf`, `email` ou `telefone` estiverem ausentes. Os campos booleanos sao opcionais (default `false`). O campo `cpf` nao pode ser alterado via PUT (desabilitado no formulario).

### 4.3 Vendas

| Metodo HTTP | Rota | Funcao |
|-------------|------|--------|
| GET | `/api/vendas` | Lista todas as vendas |
| POST | `/api/vendas` | Registra nova venda |

**Body do POST:**
```json
{
  "clienteId": 1,
  "doceId": 1,
  "quantidade": 5
}
```

**Validacoes (realizadas pelo GerenciadorDoceria):**
- Se o `clienteId` nao existe: retorna 400 com `"Cliente nao encontrado"`
- Se o `doceId` nao existe: retorna 400 com `"Doce nao encontrado"`
- Se a quantidade solicitada excede o estoque: retorna 400 com `"Estoque insuficiente"`
- A validacao de estoque usa o metodo `doce.vender()` da classe Doce, que verifica E desconta o estoque atomicamente

**Calculo automatico:**
- `valorTotal` = preco do doce * quantidade
- `dataVenda` = data atual no formato `dd/mm/aaaa`

### 4.4 Relatorio

| Metodo HTTP | Rota | Funcao |
|-------------|------|--------|
| GET | `/api/relatorio` | Retorna metricas gerais do sistema |

**Resposta:**
```json
{
  "totalDoces": 2,
  "totalClientes": 2,
  "totalVendas": 2,
  "valorEstoque": 248.00,
  "totalVendido": 32.00
}
```

---

## 5. Interface Web (Frontend)

### 5.1 Tecnologias

- **Next.js 16** (App Router) — framework React com roteamento baseado em pastas
- **React 19** — biblioteca de componentes
- **Tailwind CSS v4** — framework de estilos utilitarios
- **shadcn/ui v4** — biblioteca de componentes acessiveis (baseada em @base-ui/react)
- **Lucide React** — icones
- **Sonner** — notificacoes toast

### 5.2 Tema Visual

- Esquema de cores rosa/pink (hue 350) aplicado via CSS custom properties em `globals.css`
- Fonte principal: Inter
- Fonte mono: JetBrains Mono
- Layout com sidebar fixa (colapsavel em telas pequenas)

### 5.3 Paginas

#### Home (`src/app/page.tsx`)

Dashboard com visao geral do sistema:
- 4 cards de resumo: Doces Cadastrados, Clientes, Vendas Realizadas, Total Vendido
- 1 card destacado: Valor em Estoque (soma preco * estoque de todos os doces)
- Dados carregados do endpoint `/api/relatorio`

#### Doces (`src/app/doces/page.tsx`)

Gerenciamento completo do estoque:
- **Tabela** com colunas: ID, Nome, Categoria (badge), Preco, Estoque, Acoes
- **Pesquisa** por nome com barra de busca
- **Criar/Editar** via dialog modal com campos: Nome, Categoria, Preco, Estoque, checkbox "Fabricado em Mari"
- **Visualizar** detalhes de um doce via dialog (botao de olho)
- **Remover** com confirmacao
- Indicadores visuais:
  - Badge `Mari` ao lado do nome quando `fabricadoEmMari = true`
  - Badge vermelha no estoque quando `estoque < 5` (estoque baixo)

#### Clientes (`src/app/clientes/page.tsx`)

Gerenciamento completo de clientes:
- **Tabela** com colunas: ID, Nome, CPF, Email, Telefone, Acoes
- **Pesquisa** por nome
- **Criar/Editar** via dialog com campos: Nome, CPF (desabilitado na edicao), Email, Telefone, e 3 checkboxes de desconto
- **Visualizar** detalhes via dialog (mostra todos os 8 campos)
- **Remover** com confirmacao
- Indicadores visuais:
  - Badge `Desconto` ao lado do nome quando qualquer flag booleana e `true`

#### Vendas (`src/app/vendas/page.tsx`)

Registro e visualizacao de vendas:
- **Tabela** com colunas: ID, Cliente, Doce, Quantidade, Total, Data
- **Nova Venda** via dialog com selects de Cliente e Doce + campo de quantidade
- A tabela mostra os nomes do cliente e do doce (nao os IDs), resolvidos a partir dos dados carregados
- O botao de registrar so fica ativo apos selecionar cliente, doce e quantidade

#### Relatorios (`src/app/relatorios/page.tsx`)

Pagina dividida em 3 secoes separadas:

**Relatorio de Estoque:**
- Cards de resumo: Produtos (total), Valor em Estoque, Estoque Baixo (com alerta quando > 0)
- Tabela: Doce, Categoria, Preco Unitario, Estoque, Valor Subtotal (preco * estoque)

**Relatorio de Clientes:**
- Cards de resumo: Total de Clientes, Clientes com Compras
- Tabela: Nome, Email, Telefone, Compras (quantidade), Total Gasto (valor)

**Relatorio de Vendas:**
- Cards de resumo: Vendas Realizadas, Total Arrecadado (destaque verde), Ticket Medio
- Tabela: ID, Cliente, Doce, Quantidade, Valor, Data

---

## 6. Interfaces TypeScript (`src/lib/types.ts`)

Interfaces que representam os objetos retornados pela API (correspondentes ao `toObject()` de cada classe):

```typescript
export interface Doce {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;        // mapeado de quantidadeEstoque
  fabricadoEmMari: boolean;
}

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  torceFlamengo: boolean;
  assisteOnePiece: boolean;
  deSousa: boolean;
}

export interface Venda {
  id: number;
  clienteId: number;
  doceId: number;
  quantidade: number;
  valorTotal: number;
  dataVenda: string;
}
```

---

## 7. Componentes de UI (`src/components/`)

### Componentes de layout

- **AppLayout** (`AppLayout.tsx`) — wrapper que inclui o sidebar e o provider de notificacoes (Sonner)
- **AppSidebar** (`AppSidebar.tsx`) — sidebar lateral com menu de navegacao (Inicio, Doces, Clientes, Vendas, Relatorios)

### Componentes de UI base (`src/components/ui/`)

16 componentes da biblioteca shadcn/ui, todos reutilizaveis:

| Componente | Uso principal |
|------------|---------------|
| `badge` | Tags visuais (categorias, "Mari", "Desconto", estoque baixo) |
| `button` | Botoes de acao |
| `card` | Containers das secoes |
| `dialog` | Modais de criar/editar/visualizar |
| `dropdown-menu` | Menu do sidebar (opcoes do usuario) |
| `input` | Campos de texto dos formularios |
| `label` | Labels dos campos |
| `select` | Selects de cliente/doce na pagina de vendas |
| `separator` | Divisores visuais entre secoes |
| `sheet` | Sidebar em telas pequenas (mobile) |
| `sidebar` | Estrutura do sidebar |
| `skeleton` | Placeholder de carregamento |
| `sonner` | Provider de notificacoes toast |
| `table` | Tabelas de dados |
| `textarea` | Campos de texto multilinea |
| `tooltip` | Tooltips informativos |

---

## 8. Arquivos Removidos

| Arquivo | Motivo |
|---------|--------|
| `src/index.ts` | Ponto de entrada do app console (menu interativo via readline). Substituido pela interface web. Toda a funcionalidade do menu (cadastrar, listar, buscar, alterar, remover, vender, relatorio) agora esta acessivel pelas paginas da interface |

---

## 9. Configuracoes Alteradas

### package.json

- **Antes:** `typescript` + `ts-node` + `@types/node` (app console)
- **Agora:** Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui + Lucide + Sonner (app web)
- Script `dev` mudou de `ts-node src/index.ts` para `next dev`

### tsconfig.json

- Atualizado para o formato do Next.js (com path alias `@/*` apontando para `./src/*`)
- `jsx: "preserve"` adicionado (necessario para React/JSX)

### .gitignore

- Atualizado com regras especificas do Next.js (`.next/`, `out/`, `next-env.d.ts`)
- Adicionado `docs/private/` (documentos internos)

### Novos arquivos de config

| Arquivo | Funcao |
|---------|--------|
| `next.config.ts` | Configuracao do Next.js |
| `postcss.config.mjs` | Configuracao do PostCSS (usado pelo Tailwind) |
| `eslint.config.mjs` | Configuracao do ESLint (regras do Next.js) |
| `components.json` | Configuracao do shadcn/ui (caminhos, tema, estilo) |
| `src/app/globals.css` | Variaveis CSS do tema (cores, fontes, bordas) |
| `src/app/layout.tsx` | Layout raiz do Next.js (fonte Inter, estrutura HTML) |

---

## 10. Estrutura Final do Projeto

```
Projeto_doceria_bd/
├── src/
│   ├── models/                    # Classes OOP (entidades)
│   │   ├── Doce.ts
│   │   ├── Cliente.ts
│   │   └── Venda.ts
│   ├── services/                  # Logica de negocio
│   │   └── GerenciadorDoceria.ts
│   ├── lib/                       # Utilitarios
│   │   ├── dados.ts               # Singleton do gerenciador
│   │   ├── types.ts               # Interfaces TypeScript
│   │   └── utils.ts               # Funcao cn() para classes CSS
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API REST
│   │   │   ├── doces/
│   │   │   │   ├── route.ts       # GET (listar/pesquisar) + POST (criar)
│   │   │   │   └── [id]/route.ts  # GET (um) + PUT (atualizar) + DELETE (remover)
│   │   │   ├── clientes/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── vendas/route.ts    # GET (listar) + POST (registrar)
│   │   │   └── relatorio/route.ts # GET (metricas gerais)
│   │   ├── page.tsx               # Pagina Home (Dashboard)
│   │   ├── doces/page.tsx         # Pagina de Doces
│   │   ├── clientes/page.tsx      # Pagina de Clientes
│   │   ├── vendas/page.tsx        # Pagina de Vendas
│   │   ├── relatorios/page.tsx    # Pagina de Relatorios
│   │   ├── layout.tsx             # Layout raiz
│   │   └── globals.css            # Tema e variaveis CSS
│   ├── components/                # Componentes React
│   │   ├── AppLayout.tsx
│   │   ├── AppSidebar.tsx
│   │   └── ui/                    # 16 componentes shadcn/ui
│   └── hooks/
│       └── use-mobile.ts          # Hook para detectar tela mobile
├── docs/
│   └── public/                    # Documentacao publica
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json
└── .gitignore
```

---

## 11. Fluxo de Dados

```
[Interface Web]  →  fetch("/api/...")  →  [API Route]  →  gerenciador.metodo()
     ↑                                                         │
     │                                                         ↓
     │                                              [GerenciadorDoceria]
     │                                                         │
     │                                                         ↓
     │                                              classe.toObject()
     │                                                         │
     └──────── JSON ←── NextResponse.json() ←─────────────────┘
```

1. O frontend faz `fetch()` para uma rota da API
2. A API route chama um metodo do `GerenciadorDoceria`
3. O gerenciador manipula as instancias das classes OOP (Doce, Cliente, Venda)
4. O resultado e convertido para objeto simples via `toObject()`
5. A API route envia o JSON de volta ao frontend
6. O frontend renderiza os dados

---

## 12. Operacoes CRUD Implementadas

### Legenda
- **C** = Create (cadastrar)
- **R** = Read (listar, buscar, exibir um)
- **U** = Update (alterar)
- **D** = Delete (remover)

| Entidade | C | R (todos) | R (um) | R (pesquisa) | U | D |
|----------|---|-----------|--------|--------------|---|---|
| Doce     | POST /api/doces | GET /api/doces | GET /api/doces/[id] | GET /api/doces?nome=X | PUT /api/doces/[id] | DELETE /api/doces/[id] |
| Cliente  | POST /api/clientes | GET /api/clientes | GET /api/clientes/[id] | GET /api/clientes?nome=X | PUT /api/clientes/[id] | DELETE /api/clientes/[id] |
| Venda    | POST /api/vendas | GET /api/vendas | — | — | — | — |

---

## 13. Validacoes de Negocio

| Validacao | Onde acontece | Como funciona |
|-----------|---------------|---------------|
| Estoque insuficiente | `Doce.vender()` | Verifica se `quantidadeEstoque >= quantidade` antes de descontar |
| Cliente inexistente (na venda) | `GerenciadorDoceria.registrarVenda()` | Busca o cliente por ID antes de prosseguir |
| Doce inexistente (na venda) | `GerenciadorDoceria.registrarVenda()` | Busca o doce por ID antes de prosseguir |
| Campos obrigatorios | API routes (POST) | Retorna HTTP 400 se campos obrigatorios estiverem faltando |
| Preco nao-negativo | `Doce.setPreco()` | So altera se `novoPreco >= 0` |
| Quantidade nao-negativa | `Doce.setQuantidade()` | So altera se `novaQuantidade >= 0` |
| CPF imutavel | Frontend (dialog) | Campo CPF e desabilitado no modo de edicao |

---

## 14. Conformidade com a Especificacao — Parte 1

Mapeamento de cada requisito da Parte 1 da especificacao para o que foi implementado:

| # | Requisito | Implementacao | Onde |
|---|-----------|---------------|------|
| 1.1 | Inserir | `POST /api/doces`, `POST /api/clientes`, `POST /api/vendas` + formularios na UI | API routes + paginas `/doces`, `/clientes`, `/vendas` |
| 1.2 | Alterar | `PUT /api/doces/[id]`, `PUT /api/clientes/[id]` + botao de editar na tabela | API routes `[id]/` + dialogs de edicao |
| 1.3 | Pesquisar por nome | `GET /api/doces?nome=X`, `GET /api/clientes?nome=X` (case-insensitive, busca parcial) | Barra de pesquisa nas paginas `/doces` e `/clientes` |
| 1.4 | Remover | `DELETE /api/doces/[id]`, `DELETE /api/clientes/[id]` + confirmacao antes de executar | Botao de lixeira na tabela |
| 1.5 | Listar todos | `GET /api/doces`, `GET /api/clientes`, `GET /api/vendas` | Tabelas nas paginas `/doces`, `/clientes`, `/vendas` |
| 1.6 | Exibir um | `GET /api/doces/[id]`, `GET /api/clientes/[id]` + dialog de detalhes | Botao de olho na tabela abre dialog |
| 2 | Diagrama UML | Estrutura definida (3 entidades + 1 gerenciadora, 5 relacoes) | Entrega separada |
| 3 | Classe gerenciadora | `GerenciadorDoceria` com 22 metodos gerenciando todo o CRUD | `src/services/GerenciadorDoceria.ts` |
| 4 | Objeto com 4+ atributos | Doce: 6 atributos, Cliente: 8 atributos, Venda: 6 atributos | `src/models/` |
| 5 | Bastante metodos | Doce: 14, Cliente: 13, Venda: 8, Gerenciador: 22 = **57 metodos totais** | `src/models/` + `src/services/` |
| 6 | Relatorios separados | 3 secoes: Estoque (produtos + valor + alerta), Clientes (compras + gasto), Vendas (total + ticket medio) | Pagina `/relatorios` |

---

## 15. Preparacao para a Parte 2

Alguns campos e funcionalidades foram adicionados antecipadamente para evitar refatoracao quando a Parte 2 for implementada. Abaixo, o mapeamento entre o que a especificacao pede e o que ja foi preparado.

### Ja implementado

| Requisito da especificacao | O que foi feito | Motivo de adiantar |
|---------------------------|-----------------|-------------------|
| *"Clientes que torcem flamengo, assistem one piece e/ou sao de sousa possuem desconto nas compras"* | Campos `torceFlamengo`, `assisteOnePiece`, `deSousa` no model Cliente + checkboxes na interface + metodo `temDesconto()` + badge "Desconto" na tabela | Os campos precisam existir no model e na UI. Adiantar evita ter que modificar constructor, getters/setters, formulario e tabela depois |
| *"Verificar produtos [...] se foram fabricados em Mari"* | Campo `fabricadoEmMari` no model Doce + checkbox na interface + badge "Mari" na tabela | Mesmo motivo: campo no model + UI e mais facil adicionar agora do que refatorar depois |
| *"Caso o produto nao tenha mais estoque, uma compra nao deve ser efetivada"* | Metodo `Doce.vender()` ja verifica estoque antes de descontar. `GerenciadorDoceria.registrarVenda()` retorna erro se estoque insuficiente. API retorna HTTP 400 | Logica de negocio central que ja existia no projeto original (metodo `vender()`), apenas adaptada para retornar erro em vez de imprimir no console |
| *"Verificar produtos por nome [...] categoria"* | Busca por nome (`buscarDocesPorNome`) e por categoria (`buscarDocesPorCategoria`) no gerenciador | Metodos de busca necessarios para a Parte 1 (pesquisar por nome) e uteis para filtros da Parte 2 |
| *"Filtrar pelos produtos que possuem menos que 5 unidades"* | Badge vermelha na tabela quando `estoque < 5` + contador de "Estoque Baixo" no relatorio | Indicador visual ja pronto, falta apenas o filtro dedicado para funcionarios |
| *"Interface grafica web"* | Interface web completa com 5 paginas, sidebar, tema visual, componentes reutilizaveis | A Parte 2 exige interface grafica. Escolhemos web com Next.js |
| *"Cliente deve poder verificar seus dados cadastrais"* | Dialog de detalhes mostra todos os 8 campos do cliente (incluindo flags de desconto) | Visualizacao individual ja atende o requisito de consulta de dados cadastrais |

### Ainda nao implementado (fica para a Parte 2)

| Requisito | O que falta | Depende de |
|-----------|-------------|------------|
| *"Cada compra possui um ou mais itens"* | Entidades `Compra` + `ItemCompra` com relacao N:N com Doce | Modelagem relacional no PostgreSQL |
| *"Compra efetivada por um vendedor"* | Entidade `Vendedor` com relacao com Compra | Nova entidade + tabela |
| *"Forma de pagamento (cartao, boleto, pix ou berries)"* | Entidade `Pagamento` com tipo e status de confirmacao | Nova entidade + tabela |
| *"Logica de calculo de desconto"* | Aplicar desconto no valor da compra baseado nas flags do cliente | Os campos ja existem, falta a regra de calculo |
| *"Filtro por faixa de preco"* | Endpoint com parametros `precoMin` e `precoMax` | Novo endpoint ou query |
| *"Relatorio mensal por vendedor"* | Agrupamento de vendas por vendedor e mes | Depende da entidade Vendedor + datas |
| *"View e stored procedure"* | SQL no PostgreSQL | Migracao para banco de dados |
| *"Indices e restricoes de integridade referencial"* | DDL com CREATE INDEX, FOREIGN KEY, etc. | Migracao para banco de dados |
| *"Persistencia"* | Migrar de arrays em memoria para tabelas PostgreSQL | Mudanca de infraestrutura |
