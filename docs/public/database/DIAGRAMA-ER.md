# Diagrama Entidade-Relacionamento (ER) — Doceria Gourmet

## Visao Geral

O sistema possui 3 entidades: **Doce**, **Cliente** e **Venda**.
A Venda conecta um Cliente a um Doce, registrando a quantidade e o valor.

---

## Diagrama ER

```
     (_id_)                                              (_id_)
       |                                                   |
     (nome)                                              (nome)
       |                                                   |
  (categoria)                                            (cpf) *UNIQUE
       |                                                   |
    (preco)                                             (email)
       |                                                   |
   (estoque)                                           (telefone)
       |                                                   |
(fabricado_em_mari)                                 (torce_flamengo)
       |                                                   |
  (criado_em)                                      (assiste_one_piece)
       |                                                   |
   [ DOCE ]                                          (de_sousa)
       |                                                   |
     (0,N)                                            (criado_em)
       |                                                   |
   < contem >                                        [ CLIENTE ]
       |                                                   |
     (1,1)                                               (0,N)
       |                                                   |
   [ VENDA ] ———(1,1)——— < realiza > ———(0,N)——— [ CLIENTE ]
       |
     (_id_)
       |
  (quantidade)
       |
  (valor_total)
       |
  (data_venda)
```

**Nota:** por limitacao de texto, o diagrama acima esta linearizado.
No papel, as entidades ficam lado a lado com os losangos entre elas
e os atributos saem como raios ao redor de cada retangulo.

---

## Diagrama simplificado (como desenhar na prova)

```
                     (0,N)              (1,1)              (1,1)              (0,N)
  [ CLIENTE ] ——————————— < realiza > ——————————— [ VENDA ] ——————————— < contem > ——————————— [ DOCE ]
```

---

## Entidades e Atributos

### Doce

| Atributo | Tipo | Observacao |
|----------|------|------------|
| **_id_** | SERIAL | PK (sublinhado) |
| nome | VARCHAR(100) | NOT NULL |
| categoria | VARCHAR(50) | NOT NULL |
| preco | NUMERIC(10,2) | NOT NULL, CHECK >= 0 |
| estoque | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 |
| fabricado_em_mari | BOOLEAN | NOT NULL, DEFAULT false |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Cliente

| Atributo | Tipo | Observacao |
|----------|------|------------|
| **_id_** | SERIAL | PK (sublinhado) |
| nome | VARCHAR(100) | NOT NULL |
| cpf | VARCHAR(14) | NOT NULL, **UNIQUE** (chave candidata) |
| email | VARCHAR(100) | NOT NULL |
| telefone | VARCHAR(20) | NOT NULL |
| torce_flamengo | BOOLEAN | NOT NULL, DEFAULT false |
| assiste_one_piece | BOOLEAN | NOT NULL, DEFAULT false |
| de_sousa | BOOLEAN | NOT NULL, DEFAULT false |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Venda

| Atributo | Tipo | Observacao |
|----------|------|------------|
| **_id_** | SERIAL | PK (sublinhado) |
| quantidade | INTEGER | NOT NULL, CHECK > 0 |
| valor_total | NUMERIC(10,2) | NOT NULL, CHECK >= 0 |
| data_venda | TIMESTAMP | NOT NULL, DEFAULT NOW() |

**Nota:** `cliente_id` e `doce_id` NAO sao atributos da entidade Venda no ER.
Eles aparecem apenas no esquema relacional como FKs, resultado da conversao
dos relacionamentos `realiza` e `contem`.

---

## Relacionamentos

### Cliente realiza Venda (1:N)

| Lado | Cardinalidade | Leitura |
|------|---------------|---------|
| Cliente | **(0,N)** | Um cliente pode ter 0 a N vendas (nem todo cliente comprou) |
| Venda | **(1,1)** | Toda venda pertence a exatamente 1 cliente (obrigatorio) |

### Venda contem Doce (1:N)

| Lado | Cardinalidade | Leitura |
|------|---------------|---------|
| Doce | **(0,N)** | Um doce pode estar em 0 a N vendas (pode nunca ter sido vendido) |
| Venda | **(1,1)** | Toda venda e de exatamente 1 doce (obrigatorio) |

---

## Restricoes de Integridade

| Restricao | Onde | Descricao |
|-----------|------|-----------|
| PK | doces.id, clientes.id, vendas.id | Identificador unico, NOT NULL |
| UNIQUE | clientes.cpf | Nao permite dois clientes com mesmo CPF |
| FK RESTRICT | vendas.cliente_id → clientes.id | Nao pode deletar cliente com vendas |
| FK RESTRICT | vendas.doce_id → doces.id | Nao pode deletar doce com vendas |
| CHECK | doces.preco >= 0 | Preco nao pode ser negativo |
| CHECK | doces.estoque >= 0 | Estoque nao pode ser negativo |
| CHECK | vendas.quantidade > 0 | Venda precisa de pelo menos 1 unidade |
| CHECK | vendas.valor_total >= 0 | Valor da venda nao pode ser negativo |

---

## Observacoes sobre a Modelagem

- **Nao ha entidades fracas:** todas as entidades possuem PK propria (id SERIAL)
- **Nao ha atributos compostos:** todos os atributos sao simples/atomicos
- **Nao ha atributos multivalorados:** cada campo guarda um unico valor
- **Nao ha auto-relacionamento:** nenhuma entidade se relaciona consigo mesma
- **CPF e chave candidata:** poderia ser PK mas usamos id numerico por conveniencia
