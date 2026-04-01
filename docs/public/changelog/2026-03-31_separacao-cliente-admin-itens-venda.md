# Finalizacao da Parte 2 — Itens de Venda, Separacao Cliente/Admin, Filtros e Relatorios

**Data:** 31/03/2026

---

## O que mudou

Todas as funcionalidades pendentes da Parte 2 foram implementadas: vendas com multiplos
itens (carrinho), filtros de doces, pagina de detalhe do cliente, relatorio por vendedor,
separacao de areas cliente/admin, compra pelo cliente, e bloqueio de pagamento recusado.

---

## Novas funcionalidades

### Vendas com multiplos itens (carrinho)
- Nova tabela `itens_venda` (venda_id, doce_id, quantidade, subtotal)
- Stored procedure reescrita pra receber arrays de doces e quantidades
- Coluna `doce_id` e `quantidade` removidas da tabela `vendas` (foram pra itens)
- Frontend com carrinho: adicionar/remover doces, ver subtotal de cada, confirmar tudo junto
- Dados existentes migrados automaticamente (cada venda antiga virou 1 item)
- Endpoint `/api/vendas/[id]` retorna venda com seus itens
- Indices nas FKs de itens_venda

### Filtros de doces
- Dropdown de categoria (populado automaticamente das categorias existentes)
- Inputs de preco minimo e maximo (aceita virgula)
- Checkbox "Estoque baixo" (mostra so doces com menos de 5 unidades)
- Botao "Filtros" com badge mostrando quantos filtros ativos
- Contador "X de Y itens" quando filtros estao ativos
- Mensagem "Nenhum doce encontrado com esses filtros" quando nao acha

### Pagina de detalhe do cliente
- Nova pagina `/clientes/[id]` (e `/admin/clientes/[id]`)
- Dados cadastrais (CPF, email, telefone, flags de desconto)
- Cards de resumo: total de compras + total gasto
- Tabela de historico de compras
- Botao "Eye" na lista de clientes agora navega pra essa pagina

### Relatorio de vendas por vendedor
- Nova secao "Vendas por Vendedor" na pagina de relatorios
- Tabela com: vendedor, quantidade de vendas, total vendido, ticket medio
- Novo metodo `buscarVendasPorVendedor` no GerenciadorDoceria

### Separacao Cliente/Admin
- Tela inicial (`/`) com dois cards: "Sou Cliente" e "Sou Administrador"
- Sidebar dinamica: muda menu conforme area (/admin/* ou /cliente/*)
- Botao "Ir para Cliente/Admin" no topo direito de todas as paginas
- Botao "Trocar perfil" no rodape da sidebar
- Sem login — separacao e apenas visual

### Area do Cliente
- **Catalogo** (`/cliente`): grid de doces com filtros + botao "Comprar" em cada card
- **Compra rapida**: popup no catalogo — identifica por CPF, se nao tiver cadastra na hora
- **Comprar** (`/cliente/comprar`): carrinho completo com multiplos doces, identificacao, pagamento
- **Meus Dados** (`/cliente/meus-dados`): consulta dados cadastrais por CPF, oferece cadastro
- **Minhas Compras** (`/cliente/compras`): historico de compras por CPF
- Cliente navega livremente, so se identifica na hora de comprar (requisito da especificacao)

### Area do Admin
- Todas as paginas administrativas acessiveis via `/admin/*`
- Dashboard, CRUD de doces (com filtros), clientes (com detalhe), vendedores, vendas (carrinho), relatorios (com vendedor)

### Limite de desconto 15%
- Stored procedure limita desconto maximo a 15% (preparado pra escalar)
- Frontend mostra aviso em amarelo quando atinge o limite
- Constante `v_desconto_maximo` na procedure e `DESCONTO_MAXIMO` no frontend

### Indices B-tree nas FKs
- `idx_vendas_cliente_id`, `idx_vendas_doce_id`, `idx_vendas_vendedor_id`
- `idx_itens_venda_venda_id`, `idx_itens_venda_doce_id`
- PostgreSQL nao cria indice automatico pra FK (so pra PK e UNIQUE)

### Bloqueio de pagamento recusado
- Stored procedure rejeita venda se status = "recusado"
- Opcao "Recusado" removida dos dropdowns (so Confirmado e Pendente)
- Mensagem: "Pagamento recusado. A compra nao pode ser efetivada."

### Melhorias de UX
- Selects de cliente, vendedor e doce mostram nome em vez de ID
- Dropdown de doces em duas linhas (nome + preco/estoque)
- Resumo de venda em tempo real com preview de desconto
- Tratamento de erros no delete de vendedores (FK RESTRICT)

---

## Arquivos novos

| Arquivo | Descricao |
|---------|-----------|
| `src/app/admin/page.tsx` | Dashboard admin |
| `src/app/admin/doces/page.tsx` | CRUD doces com filtros (admin) |
| `src/app/admin/clientes/page.tsx` | CRUD clientes (admin) |
| `src/app/admin/clientes/[id]/page.tsx` | Detalhe cliente com historico (admin) |
| `src/app/admin/vendedores/page.tsx` | CRUD vendedores (admin) |
| `src/app/admin/vendas/page.tsx` | Vendas com carrinho (admin) |
| `src/app/admin/relatorios/page.tsx` | Relatorios com vendedor (admin) |
| `src/app/cliente/page.tsx` | Catalogo com compra rapida |
| `src/app/cliente/comprar/page.tsx` | Carrinho com identificacao por CPF |
| `src/app/cliente/meus-dados/page.tsx` | Consulta dados por CPF |
| `src/app/cliente/compras/page.tsx` | Historico de compras por CPF |
| `src/app/clientes/[id]/page.tsx` | Detalhe do cliente (rota original) |
| `src/app/api/vendas/[id]/route.ts` | GET venda com itens |
| `sql/migrations/004_limite_desconto_15_porcento.sql` | Limite de 15% |
| `sql/migrations/005_criar_indices.sql` | Indices B-tree nas FKs |
| `sql/migrations/006_criar_itens_vendas.sql` | Tabela itens_venda + procedure nova |
| `sql/migrations/007_bloquear_pagamento_recusado.sql` | Bloqueia venda recusada |

## Arquivos modificados

| Arquivo | O que mudou |
|---------|-------------|
| `src/app/page.tsx` | Tela inicial com escolha de perfil |
| `src/components/AppSidebar.tsx` | Sidebar dinamica admin/cliente |
| `src/components/AppLayout.tsx` | Botao trocar perfil no topo |
| `src/app/doces/page.tsx` | Filtros (categoria, preco, estoque baixo) |
| `src/app/clientes/page.tsx` | Link pro detalhe do cliente |
| `src/app/vendas/page.tsx` | Carrinho multiplos itens + selects com nome |
| `src/app/vendedores/page.tsx` | Tratamento de erro no delete |
| `src/app/relatorios/page.tsx` | Secao vendas por vendedor |
| `src/services/GerenciadorDoceria.ts` | buscarItensVenda, buscarVendasPorVendedor, registrarVenda com arrays |
| `src/lib/types.ts` | Interface ItemVenda, Venda sem doceId/quantidade |
| `src/app/api/vendas/route.ts` | POST recebe array de itens |

---

## Decisoes tecnicas

- **Itens em tabela separada**: a tabela `vendas` virou cabecalho (cliente, vendedor, valor total, pagamento) e `itens_venda` guarda cada doce com quantidade e subtotal. Relacionamento 1:N.

- **ON DELETE CASCADE em itens_venda**: se uma venda for deletada, seus itens vao junto. Diferente das outras FKs (RESTRICT) porque o item nao faz sentido sem a venda.

- **Separacao sem login**: o professor nao pediu autenticacao. A separacao e visual — o cliente nao ve opcoes de admin e vice-versa. Pra um sistema real, teria login com JWT.

- **Identificacao na compra**: o cliente navega livremente pelo catalogo. So quando clica "Comprar" precisa informar CPF. Se nao tiver cadastro, oferece cadastro rapido na mesma tela. Atende o requisito: "para navegar nao e necessario fazer compra ou esta logado, mas na hora de realizar uma compra devem ser informados os dados do cliente."

- **Pagamento recusado bloqueado**: se o status e "recusado", a compra nao acontece. O cliente tenta pagar de novo. A opcao "Recusado" foi removida dos dropdowns.
