-- Migration 006: separar itens da venda (1 venda pode ter N doces)
-- Data: 2026-03-30

-- remove a versao antiga da procedure (que recebia 1 doce so)
DROP FUNCTION IF EXISTS sp_registrar_venda(integer, integer, integer, integer, varchar, varchar);

-- cria tabela de itens (cada linha = 1 doce dentro de 1 venda)
CREATE TABLE itens_venda (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    doce_id INTEGER NOT NULL REFERENCES doces(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- indice na FK de itens_venda
CREATE INDEX IF NOT EXISTS idx_itens_venda_venda_id ON itens_venda(venda_id);
CREATE INDEX IF NOT EXISTS idx_itens_venda_doce_id ON itens_venda(doce_id);

-- migra os dados existentes: cada venda antiga vira 1 item
INSERT INTO itens_venda (venda_id, doce_id, quantidade, subtotal)
SELECT id, doce_id, quantidade, valor_total FROM vendas;

-- remove as colunas que foram pra itens_venda
ALTER TABLE vendas DROP COLUMN doce_id;
ALTER TABLE vendas DROP COLUMN quantidade;

-- atualiza a stored procedure pra receber array de itens
CREATE OR REPLACE FUNCTION sp_registrar_venda(
    p_cliente_id INTEGER,
    p_vendedor_id INTEGER,
    p_forma_pagamento VARCHAR(20),
    p_status_pagamento VARCHAR(20),
    p_doce_ids INTEGER[],
    p_quantidades INTEGER[]
)
RETURNS TABLE (
    id INTEGER,
    cliente_id INTEGER,
    vendedor_id INTEGER,
    valor_total NUMERIC(10,2),
    forma_pagamento VARCHAR(20),
    status_pagamento VARCHAR(20),
    data_venda TIMESTAMP,
    desconto_aplicado NUMERIC(5,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_desconto NUMERIC(5,2) := 0;
    v_desconto_maximo CONSTANT NUMERIC(5,2) := 15.00;
    v_valor_bruto NUMERIC(10,2) := 0;
    v_valor_total NUMERIC(10,2);
    v_venda_id INTEGER;
    v_tem_desconto BOOLEAN;
    v_torce_flamengo BOOLEAN;
    v_assiste_one_piece BOOLEAN;
    v_de_sousa BOOLEAN;
    v_preco NUMERIC(10,2);
    v_estoque INTEGER;
    i INTEGER;
BEGIN
    -- valida que os arrays tem o mesmo tamanho
    IF array_length(p_doce_ids, 1) != array_length(p_quantidades, 1) THEN
        RAISE EXCEPTION 'Arrays de doces e quantidades devem ter o mesmo tamanho';
    END IF;

    -- verifica se o cliente existe
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE clientes.id = p_cliente_id) THEN
        RAISE EXCEPTION 'Cliente nao encontrado';
    END IF;

    -- verifica se o vendedor existe
    IF NOT EXISTS (SELECT 1 FROM vendedores WHERE vendedores.id = p_vendedor_id) THEN
        RAISE EXCEPTION 'Vendedor nao encontrado';
    END IF;

    -- valida cada doce e calcula o valor bruto
    FOR i IN 1..array_length(p_doce_ids, 1) LOOP
        -- busca o doce e trava a linha
        SELECT d.preco, d.estoque INTO v_preco, v_estoque
        FROM doces d WHERE d.id = p_doce_ids[i]
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Doce ID % nao encontrado', p_doce_ids[i];
        END IF;

        IF v_estoque < p_quantidades[i] THEN
            RAISE EXCEPTION 'Estoque insuficiente para o doce ID %', p_doce_ids[i];
        END IF;

        v_valor_bruto := v_valor_bruto + (v_preco * p_quantidades[i]);
    END LOOP;

    -- calcula desconto usando a view
    v_tem_desconto := EXISTS (
        SELECT 1 FROM vw_clientes_com_desconto v WHERE v.id = p_cliente_id
    );

    IF v_tem_desconto THEN
        SELECT c.torce_flamengo, c.assiste_one_piece, c.de_sousa
        INTO v_torce_flamengo, v_assiste_one_piece, v_de_sousa
        FROM clientes c WHERE c.id = p_cliente_id;

        IF v_torce_flamengo THEN v_desconto := v_desconto + 5; END IF;
        IF v_assiste_one_piece THEN v_desconto := v_desconto + 5; END IF;
        IF v_de_sousa THEN v_desconto := v_desconto + 5; END IF;

        IF v_desconto > v_desconto_maximo THEN
            v_desconto := v_desconto_maximo;
        END IF;
    END IF;

    -- calcula valor total com desconto
    v_valor_total := v_valor_bruto - (v_valor_bruto * v_desconto / 100);

    -- insere a venda (cabecalho)
    INSERT INTO vendas (cliente_id, vendedor_id, valor_total, forma_pagamento, status_pagamento)
    VALUES (p_cliente_id, p_vendedor_id, v_valor_total, p_forma_pagamento, p_status_pagamento)
    RETURNING vendas.id INTO v_venda_id;

    -- insere cada item e desconta estoque
    FOR i IN 1..array_length(p_doce_ids, 1) LOOP
        SELECT d.preco INTO v_preco FROM doces d WHERE d.id = p_doce_ids[i];

        INSERT INTO itens_venda (venda_id, doce_id, quantidade, subtotal)
        VALUES (v_venda_id, p_doce_ids[i], p_quantidades[i], v_preco * p_quantidades[i]);

        UPDATE doces SET estoque = estoque - p_quantidades[i] WHERE doces.id = p_doce_ids[i];
    END LOOP;

    -- retorna a venda criada
    RETURN QUERY
    SELECT vendas.id, vendas.cliente_id, vendas.vendedor_id, vendas.valor_total,
           vendas.forma_pagamento, vendas.status_pagamento, vendas.data_venda, v_desconto
    FROM vendas WHERE vendas.id = v_venda_id;
END;
$$;
