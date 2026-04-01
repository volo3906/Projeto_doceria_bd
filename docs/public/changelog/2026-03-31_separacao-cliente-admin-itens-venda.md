# Separacao Cliente/Admin, Itens de Venda e Bloqueio de Recusado

**Data:** 31/03/2026

---

## O que mudou

O sistema foi dividido em duas areas (Cliente e Admin), vendas passaram a suportar
multiplos doces por compra, e pagamentos recusados sao bloqueados.

---

## Novas funcionalidades

### Separacao Cliente/Admin
- Tela inicial (`/`) com dois cards: "Sou Cliente" e "Sou Administrador"
- Sidebar dinamica: muda menu conforme area
- Botao "Ir para Cliente/Admin" no topo de todas as paginas
- Botao "Trocar perfil" no rodape da sidebar
- Sem login — separacao e apenas visual

### Area do Cliente
- **Catalogo** (`/cliente`): grid de doces com filtros + botao "Comprar" em cada card
- **Compra rapida**: popup no catalogo com identificacao por CPF, cadastro rapido se nao existir
- **Comprar** (`/cliente/comprar`): carrinho completo com multiplos doces
- **Meus Dados** (`/cliente/meus-dados`): consulta dados por CPF
- **Minhas Compras** (`/cliente/compras`): historico de compras por CPF
- Identificacao so na hora da compra (navega livremente sem se identificar)

### Area do Admin
- Todas as paginas administrativas movidas pra `/admin/*`
- Dashboard, CRUD de doces/clientes/vendedores, vendas, relatorios

### Multiplos itens por venda
- Nova tabela `itens_venda` (venda_id, doce_id, quantidade, subtotal)
- Stored procedure reescrita pra receber arrays de doces e quantidades
- Frontend com carrinho: adicionar/remover doces antes de confirmar
- Endpoint `/api/vendas/[id]` retorna venda com seus itens

### Bloqueio de pagamento recusado
- Procedure rejeita venda se status = "recusado"
- Opcao "Recusado" removida dos dropdowns (so Confirmado e Pendente)

### Selects mostrando nome
- Dropdowns de cliente, vendedor e doce mostram nome em vez de ID

---

## Arquivos novos

| Arquivo | Descricao |
|---------|-----------|
| `src/app/admin/page.tsx` | Dashboard admin |
| `src/app/admin/doces/page.tsx` | CRUD doces (admin) |
| `src/app/admin/clientes/page.tsx` | CRUD clientes (admin) |
| `src/app/admin/clientes/[id]/page.tsx` | Detalhe cliente (admin) |
| `src/app/admin/vendedores/page.tsx` | CRUD vendedores (admin) |
| `src/app/admin/vendas/page.tsx` | Vendas com carrinho (admin) |
| `src/app/admin/relatorios/page.tsx` | Relatorios (admin) |
| `src/app/cliente/page.tsx` | Catalogo com compra rapida |
| `src/app/cliente/comprar/page.tsx` | Carrinho com identificacao |
| `src/app/cliente/meus-dados/page.tsx` | Consulta dados por CPF |
| `src/app/cliente/compras/page.tsx` | Historico de compras |
| `sql/migrations/007_bloquear_pagamento_recusado.sql` | Bloqueia venda recusada |

## Arquivos modificados

| Arquivo | O que mudou |
|---------|-------------|
| `src/app/page.tsx` | Tela inicial com escolha de perfil |
| `src/components/AppSidebar.tsx` | Sidebar dinamica admin/cliente |
| `src/components/AppLayout.tsx` | Botao trocar perfil no topo |
| `src/app/vendas/page.tsx` | Selects com nome em vez de ID |
