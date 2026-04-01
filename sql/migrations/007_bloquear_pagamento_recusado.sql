-- Migration 007: bloquear registro de venda com pagamento recusado
-- Data: 2026-03-30
-- Se o pagamento foi recusado, a compra nao deve ser efetivada

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
    -- bloqueia venda com pagamento recusado
    IF p_status_pagamento = 'recusado' THEN
        RAISE EXCEPTION 'Pagamento recusado. A compra nao pode ser efetivada.';
    END IF;

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
