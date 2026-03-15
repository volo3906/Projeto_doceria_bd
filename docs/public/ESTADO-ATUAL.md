# Estado Atual do Projeto — Doceria Gourmet

> Este documento descreve o estado atual do sistema. Ele e atualizado sempre que algo muda no projeto, refletindo o que existe **agora** (nao o historico). Para ver o que mudou e quando, consulte a pasta `changelog/`.

---

## Visao Geral

O sistema Doceria Gourmet e uma aplicacao web para gerenciamento de uma doceria. Permite cadastrar doces, clientes e registrar vendas, com relatorios de estoque, clientes e vendas.

**Stack atual:**
- Backend: Next.js 16 (API Routes) + TypeScript
- Frontend: React 19 + Tailwind CSS 4 + shadcn/ui
- Banco de dados: em memoria (arrays na classe GerenciadorDoceria)
- OOP: classes com atributos `private`, getters, setters e metodos de negocio

**Status:** funcional, sem persistencia em banco de dados.

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

Classe central que gerencia todas as operacoes do sistema. Trabalha internamente com instancias das classes OOP e retorna objetos simples (via `toObject()`) para a API.

**Total de metodos:** 22

| Grupo | Metodos | Operacoes |
|-------|---------|-----------|
| Doces | 10 | listar, buscar por ID, buscar por nome, buscar por categoria, cadastrar, atualizar, remover, contar, calcular valor estoque |
| Clientes | 8 | listar, buscar por ID, buscar por nome, buscar por CPF, cadastrar, atualizar, remover, contar |
| Vendas | 6 | listar, buscar por ID, buscar por cliente, registrar, contar, calcular total vendido |
| Relatorios | 1 | gerar relatorio geral (totais + valores) |

**Instancia unica:** o sistema usa o padrao singleton via `globalThis` (`src/lib/dados.ts`) para garantir que todas as rotas da API compartilham a mesma instancia.

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
| Validacao de estoque | Uma venda so e registrada se houver estoque suficiente | `Doce.vender()` |
| Cliente obrigatorio na venda | O cliente precisa existir para registrar uma venda | `GerenciadorDoceria.registrarVenda()` |
| Doce obrigatorio na venda | O doce precisa existir para registrar uma venda | `GerenciadorDoceria.registrarVenda()` |
| Campos obrigatorios | Doce: nome, categoria, preco, estoque. Cliente: nome, cpf, email, telefone | API routes (POST) |
| CPF imutavel | O CPF de um cliente nao pode ser alterado depois do cadastro | Frontend (campo desabilitado na edicao) |
| Preco nao-negativo | O preco so e alterado se o novo valor for >= 0 | `Doce.setPreco()` |
| Quantidade nao-negativa | A quantidade so e alterada se o novo valor for >= 0 | `Doce.setQuantidade()` |

---

## Persistencia de Dados

**Situacao atual:** os dados ficam em memoria (arrays dentro do `GerenciadorDoceria`). Quando o servidor e parado e reiniciado, todos os dados sao perdidos.

**Proximos passos (planejado):** migrar para PostgreSQL com tabelas, indices, views e stored procedures. Os IDs passarao a ser gerados pelo banco (SERIAL ou GENERATED ALWAYS AS IDENTITY).

---

## Estrutura de Pastas

```
src/
├── models/                        # Entidades OOP
│   ├── Doce.ts                    # 6 atributos, 14 metodos
│   ├── Cliente.ts                 # 8 atributos, 13 metodos
│   └── Venda.ts                   # 6 atributos, 8 metodos
├── services/
│   └── GerenciadorDoceria.ts      # 22 metodos, gerencia todo o CRUD
├── lib/
│   ├── dados.ts                   # Singleton do gerenciador (globalThis)
│   ├── types.ts                   # Interfaces TypeScript (Doce, Cliente, Venda)
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
│   ├── layout.tsx                 # Layout raiz (fonte Inter)
│   └── globals.css                # Tema rosa/pink (hue 350)
├── components/
│   ├── AppLayout.tsx              # Wrapper com sidebar + sonner
│   ├── AppSidebar.tsx             # Menu lateral de navegacao
│   └── ui/                        # 16 componentes shadcn/ui
└── hooks/
    └── use-mobile.ts              # Detecta tela mobile
```

---

## Documentacao Disponivel

| Documento | Caminho | Descricao |
|-----------|---------|-----------|
| Estado Atual | `docs/public/ESTADO-ATUAL.md` | Este documento — visao geral atualizada do projeto |
| Como Rodar | `docs/public/COMO-RODAR.md` | Guia passo a passo para rodar o projeto localmente |
| Changelogs | `docs/public/changelog/` | Historico de mudancas com datas |
