# Esquema Relacional — Doceria Gourmet

## Notacao

- **_sublinhado_** = Chave Primaria (PK)
- **(FK)** = Chave Estrangeira
- "referencia" indica pra qual tabela/coluna a FK aponta

---

## Esquema

```
Doces (_id_, nome, categoria, preco, estoque, fabricado_em_mari, criado_em)

Clientes (_id_, nome, cpf, email, telefone, torce_flamengo, assiste_one_piece, de_sousa, criado_em)

Vendas (_id_, cliente_id, doce_id, quantidade, valor_total, data_venda)
    cliente_id referencia Clientes(id)
    doce_id referencia Doces(id)
```

---

## Conversao ER → Relacional (regras aplicadas)

### Regra 1 — Entidades fortes viraram tabelas

As 3 entidades (Doce, Cliente, Venda) viraram as 3 tabelas diretamente.
Cada atributo virou uma coluna. A PK (id) foi mantida.

### Regra 2 — Relacionamentos 1:N viraram FKs

Os dois relacionamentos do ER (realiza e contem) eram 1:N.
O losango sumiu e a PK do lado 1 virou FK no lado N (Vendas):

| Relacionamento ER | Regra | Resultado |
|-------------------|-------|-----------|
| Cliente —1:N— Venda (realiza) | PK do lado 1 vira FK no lado N | `cliente_id` apareceu em Vendas |
| Doce —1:N— Venda (contem) | PK do lado 1 vira FK no lado N | `doce_id` apareceu em Vendas |

### Nenhuma tabela intermediaria

Como nao ha relacionamentos N:M, nao foi necessario criar tabelas intermediarias.
Se o sistema permitisse vender varios doces na mesma venda (N:M), seria necessario
uma tabela `Itens_Venda (_id_venda_, _id_doce_, quantidade, subtotal)`.

---

## Tipos de Chave no Projeto

| Tipo | Exemplo | Descricao |
|------|---------|-----------|
| **PK** | doces.id, clientes.id, vendas.id | Identifica unicamente cada registro |
| **Candidata** | clientes.cpf | UNIQUE — poderia ser PK mas usamos id |
| **FK** | vendas.cliente_id, vendas.doce_id | Aponta pra PK de outra tabela |

---

## Restricoes de Integridade

### Integridade de Entidade
Toda PK e unica e nao nula. Garantido pelo SERIAL (auto-incremento).

### Integridade Referencial
- `vendas.cliente_id` → `clientes.id` com **ON DELETE RESTRICT**
- `vendas.doce_id` → `doces.id` com **ON DELETE RESTRICT**
- Nao e possivel deletar um cliente ou doce que tenha vendas associadas

### Integridade de Dominio
- `preco` e `valor_total` sao NUMERIC(10,2) — valores monetarios exatos
- `estoque` e `quantidade` sao INTEGER — numeros inteiros
- Campos booleanos aceitam apenas true/false
- CHECK constraints validam intervalos (preco >= 0, quantidade > 0)

---

## Normalizacao

### 1FN — Primeira Forma Normal ✓
Todos os atributos sao atomicos. Nenhum campo contem listas ou grupos repetidos.

### 2FN — Segunda Forma Normal ✓
Todas as tabelas possuem PK simples (id). Com PK simples, a 2FN e automatica.

### 3FN — Terceira Forma Normal ✓
Nao ha dependencias transitivas:
- Em **Doces**: todos os atributos dependem diretamente do id
- Em **Clientes**: todos os atributos dependem diretamente do id (cpf e chave candidata, nao intermediaria)
- Em **Vendas**: cliente_id e doce_id sao FKs, nao carregam dados do cliente/doce (nome, email, preco ficam nas tabelas originais)

O esquema ja nasceu normalizado porque as entidades foram separadas desde o inicio.
