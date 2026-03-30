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

Vendedores (_id_, nome, cpf, email, telefone, criado_em)

Vendas (_id_, cliente_id, doce_id, vendedor_id, quantidade, valor_total, forma_pagamento, status_pagamento, data_venda)
    cliente_id referencia Clientes(id)
    doce_id referencia Doces(id)
    vendedor_id referencia Vendedores(id)
```

---

## Conversao ER → Relacional (regras aplicadas)

### Regra 1 — Entidades fortes viraram tabelas

As 4 entidades (Doce, Cliente, Vendedor, Venda) viraram tabelas diretamente.

### Regra 2 — Relacionamentos 1:N viraram FKs

Os 3 relacionamentos do ER eram 1:N. O losango sumiu e a PK do lado 1 virou FK no lado N (Vendas):

| Relacionamento ER | Resultado |
|-------------------|-----------|
| Cliente —1:N— Venda (realiza) | `cliente_id` em Vendas |
| Doce —1:N— Venda (contem) | `doce_id` em Vendas |
| Vendedor —1:N— Venda (efetivada) | `vendedor_id` em Vendas |

---

## Tipos de Chave

| Tipo | Exemplo |
|------|---------|
| **PK** | doces.id, clientes.id, vendedores.id, vendas.id |
| **Candidata** | clientes.cpf, vendedores.cpf (UNIQUE, poderia ser PK) |
| **FK** | vendas.cliente_id, vendas.doce_id, vendas.vendedor_id |

---

## Restricoes de Integridade

### Integridade de Entidade
Toda PK e unica e nao nula (SERIAL).

### Integridade Referencial
- `vendas.cliente_id` → `clientes.id` com ON DELETE RESTRICT
- `vendas.doce_id` → `doces.id` com ON DELETE RESTRICT
- `vendas.vendedor_id` → `vendedores.id` com ON DELETE RESTRICT

### Integridade de Dominio
- `preco` e `valor_total`: NUMERIC(10,2)
- `forma_pagamento`: CHECK IN (cartao, boleto, pix, berries, dinheiro)
- `status_pagamento`: CHECK IN (confirmado, pendente, recusado)
- `cpf`: VARCHAR(11) somente digitos
- `telefone`: VARCHAR(13) somente digitos com DDI

---

## Objetos do Banco

### View
```sql
vw_clientes_com_desconto — clientes com alguma flag de desconto ativa
```

### Stored Procedure
```sql
sp_registrar_venda(cliente_id, doce_id, vendedor_id, quantidade, forma_pagamento, status_pagamento)
— registra venda com desconto automatico (5% por flag, limite maximo 15%)
```

### Indices (B-tree nas FKs)
```sql
idx_vendas_cliente_id ON vendas(cliente_id)
idx_vendas_doce_id ON vendas(doce_id)
idx_vendas_vendedor_id ON vendas(vendedor_id)
```

### Tabela de controle
```sql
migrations_executadas — controla quais migrations ja rodaram no banco
```

---

## Normalizacao

### 1FN ✓
Todos os atributos sao atomicos.

### 2FN ✓
Todas as tabelas possuem PK simples (id).

### 3FN ✓
Nao ha dependencias transitivas. Dados do cliente, doce e vendedor ficam nas tabelas originais — a tabela de vendas so guarda FKs.
