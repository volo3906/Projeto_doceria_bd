# Parte 2 — Vendedores, Normalizacao e Sistema de Desconto

**Data:** 30/03/2026

---

## O que mudou

Inicio da Parte 2 do projeto. O sistema foi estendido com a entidade Vendedores,
formas de pagamento, normalizacao de dados (CPF/telefone somente digitos),
formatacao em pt-BR, sistema de migrations e desconto automatico via stored procedure.

---

## Contribuicoes

- **Johan**: normalizacao de dados, tratamento de erros, sistema de migrations, stored procedure, UX de desconto, documentacao
- **Luiz**: entidade vendedores, sistema de vendas ampliado (pagamento, status), view de clientes com desconto

---

## Novas funcionalidades

### Entidade Vendedores
- Nova tabela `vendedores` (id, nome, cpf, email, telefone)
- CRUD completo: cadastrar, listar, editar, remover
- Pagina `/vendedores` no frontend com tabela e formulario
- Rota da API `/api/vendedores` e `/api/vendedores/[id]`
- Sidebar atualizada com link para Vendedores

### Sistema de Vendas ampliado
- Venda agora exige um vendedor (vendedor_id como FK)
- Formas de pagamento: cartao, boleto, pix, berries, dinheiro
- Status de pagamento: confirmado, pendente, recusado (obrigatorio para cartao/boleto/pix/berries)
- Tabela de vendas exibe todas as colunas novas
- Vendas anteriores a implementacao mostram "—" nos campos que nao existiam

### Normalizacao de dados (issue #2)
- CPF armazenado somente como digitos no banco (VARCHAR(11))
- Telefone armazenado somente como digitos com DDI (VARCHAR(13))
- Mascaras de input no frontend: CPF formata automaticamente enquanto digita
- Telefone formata com +55 (DDD) automaticamente
- Exibicao formatada em todas as paginas (123.456.789-00, +55 (83) 99999-0001)
- Precos exibidos em formato brasileiro (R$ 4,50 com virgula)
- Input de preco aceita tanto virgula quanto ponto

### Tratamento de erros no frontend
- Todas as paginas agora mostram toast de erro quando a API falha
- DELETE com FK RESTRICT mostra "Nao e possivel remover: tem vendas associadas"
- POST com CPF duplicado mostra "CPF ja cadastrado"
- GET com falha mostra "Erro ao conectar com o servidor"
- try/catch em todos os fetch, incluindo Promise.all na pagina de vendas

### Sistema de Migrations
- Pasta `sql/migrations/` com arquivos SQL sequenciais
- Script `scripts/migrate.mjs` que roda migrations pendentes automaticamente
- Tabela `migrations_executadas` no banco controla o que ja rodou
- Cada migration roda em transacao (COMMIT/ROLLBACK)
- Uso: `node scripts/migrate.mjs`

### Stored Procedure com desconto automatico
- Funcao `sp_registrar_venda` no PostgreSQL
- Calcula desconto automatico: 5% por flag (flamengo, one piece, sousa)
- Soma direta: 1 flag = 5%, 2 flags = 10%, 3 flags = 15%
- Limite maximo de 15% de desconto (preparado pra escalar com mais criterios no futuro)
- Consulta a view `vw_clientes_com_desconto` pra verificar elegibilidade
- Toda a logica de venda (validacao, estoque, desconto, insert) atomica no banco
- GerenciadorDoceria agora chama a procedure em vez de fazer logica manual

### UX de desconto na venda
- Resumo da venda aparece em tempo real no formulario
- Mostra valor bruto, percentual de desconto e valor final
- Explica o motivo do desconto ("tem desconto por: Flamengo One Piece")
- Aviso em amarelo quando o desconto atinge o limite maximo de 15%
- Toast apos venda informa o percentual aplicado

### Indices nas FKs de vendas
- `idx_vendas_cliente_id` — acelera busca de vendas por cliente e verificacao FK no DELETE
- `idx_vendas_doce_id` — acelera stored procedure (FOR UPDATE) e verificacao FK
- `idx_vendas_vendedor_id` — acelera relatorio por vendedor e verificacao FK
- PostgreSQL nao cria indice automatico pra FK (so pra PK e UNIQUE)

### Views (Parte 2)
- View `vw_clientes_com_desconto` — lista clientes elegiveis a desconto
- Arquivo `sql/views.sql` separado do init.sql pra organizacao
- Migration 002 cria a view no banco existente

### Documentacao de banco de dados
- Diagrama ER em `docs/public/database/DIAGRAMA-ER.md`
- Esquema relacional em `docs/public/database/ESQUEMA-RELACIONAL.md`

---

## Arquivos novos

| Arquivo | Descricao |
|---------|-----------|
| `src/app/vendedores/page.tsx` | Pagina de CRUD de vendedores |
| `src/app/api/vendedores/route.ts` | Rota GET + POST vendedores |
| `src/app/api/vendedores/[id]/route.ts` | Rota DELETE + PATCH vendedor |
| `src/models/Vendedor.ts` | Classe OOP do vendedor |
| `src/lib/utils.ts` | Helpers de formatacao (CPF, telefone, preco) |
| `sql/views.sql` | Views do banco (parte 2) |
| `sql/migrations/001_normalizar_cpf_telefone.sql` | Migra dados existentes pra digitos |
| `sql/migrations/002_criar_views.sql` | Cria views no banco existente |
| `sql/migrations/003_stored_procedure_registrar_venda.sql` | Procedure de venda com desconto |
| `sql/migrations/004_limite_desconto_15_porcento.sql` | Limite maximo de 15% no desconto |
| `sql/migrations/005_criar_indices.sql` | Indices B-tree nas FKs de vendas |
| `scripts/migrate.mjs` | Script que roda migrations pendentes |
| `docs/public/database/DIAGRAMA-ER.md` | Diagrama ER do projeto |
| `docs/public/database/ESQUEMA-RELACIONAL.md` | Esquema relacional formal |

## Arquivos modificados

| Arquivo | O que mudou |
|---------|-------------|
| `sql/init.sql` | Tabela vendedores, FKs novas em vendas, seed data em digitos |
| `src/services/GerenciadorDoceria.ts` | CRUD vendedores, normaliza CPF/tel, usa stored procedure |
| `src/app/vendas/page.tsx` | Campos vendedor/pagamento/status, resumo com desconto |
| `src/app/clientes/page.tsx` | Mascaras de input, formatacao, tratamento de erros |
| `src/app/doces/page.tsx` | Precos em pt-BR, input aceita virgula, tratamento de erros |
| `src/app/page.tsx` | Precos em pt-BR no dashboard |
| `src/app/relatorios/page.tsx` | Precos e telefone formatados |
| `src/app/vendedores/page.tsx` | Mascaras CPF/tel, formatacao |
| `src/lib/types.ts` | Interface Vendedor, campos novos em Venda |
| `src/models/Venda.ts` | Atributos vendedorId, formaPagamento, statusPagamento |
| `src/components/AppSidebar.tsx` | Link Vendedores no menu |
| `.gitignore` | Ignora *.session.sql |

---

## Decisoes tecnicas

- **Somente digitos no banco**: CPF e telefone sao armazenados sem formatacao.
  Formatacao e responsabilidade do frontend. Evita problemas com UNIQUE e busca.

- **Migrations em vez de recriar**: Sistema de migrations permite alterar o banco
  sem perder dados. Cada migration roda uma vez e e registrada na tabela de controle.

- **Stored procedure no banco**: Toda a logica de venda (validacao, estoque, desconto)
  roda atomicamente no PostgreSQL. O codigo TypeScript so chama a procedure.

- **Desconto por flags**: 5% por flag ativa (torce_flamengo, assiste_one_piece, de_sousa),
  soma direta ate 15%. Calculado dentro da procedure usando a view de desconto.

- **Vendas antigas com campos nulos**: Vendas registradas antes da implementacao de
  vendedores mostram "—" no frontend em vez de "Vendedor #null".
