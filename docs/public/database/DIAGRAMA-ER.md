# Diagrama Entidade-Relacionamento (ER) — Doceria Gourmet

## Visao Geral

O sistema possui 5 entidades: **Doce**, **Cliente**, **Vendedor**, **Venda** e **ItemVenda**.
Uma Venda pertence a um Cliente e um Vendedor. Cada Venda pode ter multiplos Itens, onde cada Item referencia um Doce com sua quantidade e subtotal.

---

## Diagrama simplificado

```
                (0,N)              (1,1)                    (1,N)              (1,1)              (0,N)
 [ CLIENTE ] ————————— < realiza > ————————— [ VENDA ] ————————— < possui > ————————— [ ITEM_VENDA ]
                                                 |                                          |
                                               (1,1)                                      (1,1)
                                                 |                                          |
                                           < efetivada >                              < referencia >
                                                 |                                          |
                                               (0,N)                                      (0,N)
                                                 |                                          |
                                          [ VENDEDOR ]                                  [ DOCE ]
```

---

## Entidades e Atributos

### Doce

| Atributo | Tipo | Observacao |
|----------|------|------------|
| **_id_** | SERIAL | PK |
| nome | VARCHAR(100) | NOT NULL |
| categoria | VARCHAR(50) | NOT NULL |
| preco | NUMERIC(10,2) | NOT NULL, CHECK >= 0 |
| estoque | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 |
| fabricado_em_mari | BOOLEAN | NOT NULL, DEFAULT false |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Cliente

| Atributo | Tipo | Observacao |
|----------|------|------------|
| **_id_** | SERIAL | PK |
| nome | VARCHAR(100) | NOT NULL |
| cpf | VARCHAR(11) | NOT NULL, UNIQUE (somente digitos) |
| email | VARCHAR(100) | NOT NULL |
| telefone | VARCHAR(13) | NOT NULL (somente digitos com DDI) |
| torce_flamengo | BOOLEAN | NOT NULL, DEFAULT false (5% desconto) |
| assiste_one_piece | BOOLEAN | NOT NULL, DEFAULT false (5% desconto) |
| de_sousa | BOOLEAN | NOT NULL, DEFAULT false (5% desconto) |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Vendedor

| Atributo | Tipo | Observacao |
|----------|------|------------|
| **_id_** | SERIAL | PK |
| nome | VARCHAR(100) | NOT NULL |
| cpf | VARCHAR(11) | NOT NULL, UNIQUE (somente digitos) |
| email | VARCHAR(100) | NOT NULL |
| telefone | VARCHAR(13) | NOT NULL (somente digitos com DDI) |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Venda

| Atributo | Tipo | Observacao |
|----------|------|------------|
| **_id_** | SERIAL | PK |
| quantidade | INTEGER | NOT NULL, CHECK > 0 |
| valor_total | NUMERIC(10,2) | NOT NULL, CHECK >= 0 (ja com desconto) |
| forma_pagamento | VARCHAR(20) | NOT NULL, CHECK IN (cartao, boleto, pix, berries, dinheiro) |
| status_pagamento | VARCHAR(20) | CHECK IN (confirmado, pendente, recusado) |
| data_venda | TIMESTAMP | NOT NULL, DEFAULT NOW() |

**Nota:** `cliente_id` e `vendedor_id` NAO sao atributos da entidade Venda no ER. Aparecem no esquema relacional como FKs dos relacionamentos.

### ItemVenda

| Atributo | Tipo | Observacao |
|----------|------|------------|
| **_id_** | SERIAL | PK |
| quantidade | INTEGER | NOT NULL, CHECK > 0 |
| subtotal | NUMERIC(10,2) | NOT NULL, CHECK >= 0 |

**Nota:** `venda_id` e `doce_id` sao FKs dos relacionamentos.

---

## Relacionamentos

### Cliente realiza Venda (1:N)

| Lado | Cardinalidade | Leitura |
|------|---------------|---------|
| Cliente | **(0,N)** | Um cliente pode ter 0 a N vendas |
| Venda | **(1,1)** | Toda venda pertence a exatamente 1 cliente |

### Venda possui ItemVenda (1:N)

| Lado | Cardinalidade | Leitura |
|------|---------------|---------|
| Venda | **(1,N)** | Toda venda tem pelo menos 1 item |
| ItemVenda | **(1,1)** | Todo item pertence a exatamente 1 venda |

### ItemVenda referencia Doce (N:1)

| Lado | Cardinalidade | Leitura |
|------|---------------|---------|
| Doce | **(0,N)** | Um doce pode estar em 0 a N itens |
| ItemVenda | **(1,1)** | Todo item referencia exatamente 1 doce |

### Venda efetivada por Vendedor (1:N)

| Lado | Cardinalidade | Leitura |
|------|---------------|---------|
| Vendedor | **(0,N)** | Um vendedor pode ter 0 a N vendas |
| Venda | **(1,1)** | Toda venda e efetivada por exatamente 1 vendedor |

---

## Restricoes de Integridade

| Restricao | Onde | Descricao |
|-----------|------|-----------|
| PK | todas as tabelas | Identificador unico, NOT NULL |
| UNIQUE | clientes.cpf, vendedores.cpf | Nao permite CPF duplicado |
| FK RESTRICT | vendas.cliente_id → clientes.id | Nao pode deletar cliente com vendas |
| FK RESTRICT | vendas.doce_id → doces.id | Nao pode deletar doce com vendas |
| FK RESTRICT | vendas.vendedor_id → vendedores.id | Nao pode deletar vendedor com vendas |
| CHECK | doces.preco >= 0 | Preco nao negativo |
| CHECK | doces.estoque >= 0 | Estoque nao negativo |
| CHECK | vendas.quantidade > 0 | Pelo menos 1 unidade |
| CHECK | vendas.forma_pagamento | Valores validos: cartao, boleto, pix, berries, dinheiro |
| CHECK | vendas.status_pagamento | Valores validos: confirmado, pendente, recusado |

---

## Objetos do Banco (Parte 2)

### View: vw_clientes_com_desconto
Lista clientes que possuem alguma flag de desconto ativa.
Usada pela stored procedure pra verificar elegibilidade.

### Stored Procedure: sp_registrar_venda
Registra venda atomicamente: valida cliente/doce/vendedor, verifica estoque,
calcula desconto (5% por flag via view), desconta estoque e insere a venda.
