# Migracao para PostgreSQL

**Data:** 16/03/2026

---

## O que mudou

O sistema deixou de armazenar dados em memoria (arrays no `GerenciadorDoceria`) e passou a usar **PostgreSQL 16** como banco de dados relacional. Os dados agora persistem entre reinicializacoes do servidor.

---

## Antes vs Agora

| Aspecto | Antes | Agora |
|---------|-------|-------|
| Armazenamento | Arrays em memoria | PostgreSQL 16 (Docker) |
| Persistencia | Dados perdidos ao reiniciar | Dados persistentes |
| IDs | Contadores manuais (`proximoDoceId++`) | `SERIAL` gerado pelo banco |
| Validacoes | Setters das classes OOP | CHECK constraints no banco |
| CPF duplicado | Sem verificacao | Constraint UNIQUE |
| Integridade referencial | Sem protecao | FK com ON DELETE RESTRICT |
| Vendas | Operacao simples em memoria | Transacao com FOR UPDATE |
| Conexao | N/A | Pool de conexoes (`pg`, max 10) |

---

## Arquivos novos

| Arquivo | Descricao |
|---------|-----------|
| `docker-compose.yml` | Container PostgreSQL 16 na porta 5433 |
| `sql/init.sql` | Schema (3 tabelas) + seed data (5 doces, 3 clientes) |
| `.env.example` | Template de credenciais para o banco |
| `src/lib/db.ts` | Pool de conexao com `pg` (node-postgres) |
| `docs/public/database/BANCO-DE-DADOS.md` | Documentacao completa do banco |

## Arquivos modificados

| Arquivo | O que mudou |
|---------|------------|
| `src/services/GerenciadorDoceria.ts` | Reescrita completa: arrays → SQL queries, todos os metodos agora sao async + 3 helpers privados |
| `src/lib/dados.ts` | Removido `globalThis` (classe agora e stateless) |
| `src/app/api/doces/route.ts` | Adicionado `await` nas chamadas |
| `src/app/api/doces/[id]/route.ts` | Adicionado `await`, removido `.toObject()`, try/catch para FK |
| `src/app/api/clientes/route.ts` | Adicionado `await`, try/catch para CPF duplicado |
| `src/app/api/clientes/[id]/route.ts` | Adicionado `await`, removido `.toObject()`, try/catch para FK |
| `src/app/api/vendas/route.ts` | Adicionado `await` nas chamadas |
| `src/app/api/relatorio/route.ts` | Adicionado `await` na chamada |
| `package.json` | Adicionado `pg` e `@types/pg` |

---

## Schema do banco

3 tabelas com constraints de integridade:

- **doces**: 7 colunas, CHECK em preco e estoque
- **clientes**: 9 colunas, UNIQUE no CPF
- **vendas**: 6 colunas, FK para doces e clientes (ON DELETE RESTRICT), CHECK em quantidade e valor_total

Detalhes completos em `docs/public/database/BANCO-DE-DADOS.md`.

---

## Decisoes tecnicas

- **`pg` (node-postgres)** em vez de ORM — SQL direto, mais simples e visivel para o professor
- **`NUMERIC(10,2)`** para dinheiro — evita erros de arredondamento com float
- **`snake_case` no banco, `camelCase` na API** — mapeamento feito nos helpers `formatarX()`
- **`ON DELETE RESTRICT`** nas FKs — impede deletar doce/cliente com vendas associadas
- **Transacao com `FOR UPDATE`** no `registrarVenda` — evita condicao de corrida no estoque
- **Sem indices** — ficam para a Parte 2
