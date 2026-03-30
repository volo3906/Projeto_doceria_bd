-- Migration 004: adicionar limite maximo de 15% no desconto da stored procedure
-- Data: 2026-03-30
-- Motivo: preparar para escalar com mais criterios de desconto no futuro
-- sem deixar o desconto passar de 15%

CREATE OR REPLACE FUNCTION sp_registrar_venda(
    p_cliente_id INTEGER,
    p_doce_id INTEGER,
    p_vendedor_id INTEGER,
    p_quantidade INTEGER,
    p_forma_pagamento VARCHAR(20),
    p_status_pagamento VARCHAR(20) DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    cliente_id INTEGER,
    doce_id INTEGER,
    vendedor_id INTEGER,
    quantidade INTEGER,
    valor_total NUMERIC(10,2),
    forma_pagamento VARCHAR(20),
    status_pagamento VARCHAR(20),
    data_venda TIMESTAMP,
    desconto_aplicado NUMERIC(5,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_preco NUMERIC(10,2);
    v_estoque INTEGER;
    v_desconto NUMERIC(5,2) := 0;
    v_desconto_maximo CONSTANT NUMERIC(5,2) := 15.00;
    v_valor_total NUMERIC(10,2);
    v_tem_desconto BOOLEAN;
    v_torce_flamengo BOOLEAN;
    v_assiste_one_piece BOOLEAN;
    v_de_sousa BOOLEAN;
BEGIN
    -- verifica se o cliente existe
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE clientes.id = p_cliente_id) THEN
        RAISE EXCEPTION 'Cliente nao encontrado';
    END IF;

    -- verifica se o vendedor existe
    IF NOT EXISTS (SELECT 1 FROM vendedores WHERE vendedores.id = p_vendedor_id) THEN
        RAISE EXCEPTION 'Vendedor nao encontrado';
    END IF;

    -- busca o doce e trava a linha (FOR UPDATE)
    SELECT d.preco, d.estoque INTO v_preco, v_estoque
    FROM doces d WHERE d.id = p_doce_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Doce nao encontrado';
    END IF;

    -- verifica estoque
    IF v_estoque < p_quantidade THEN
        RAISE EXCEPTION 'Estoque insuficiente';
    END IF;

    -- calcula desconto usando a view vw_clientes_com_desconto
    -- 5% por flag (torce_flamengo, assiste_one_piece, de_sousa), soma direta
    v_tem_desconto := EXISTS (
        SELECT 1 FROM vw_clientes_com_desconto v WHERE v.id = p_cliente_id
    );

    IF v_tem_desconto THEN
        SELECT c.torce_flamengo, c.assiste_one_piece, c.de_sousa
        INTO v_torce_flamengo, v_assiste_one_piece, v_de_sousa
        FROM clientes c WHERE c.id = p_cliente_id;

        -- 5% por cada flag ativa
        IF v_torce_flamengo THEN v_desconto := v_desconto + 5; END IF;
        IF v_assiste_one_piece THEN v_desconto := v_desconto + 5; END IF;
        IF v_de_sousa THEN v_desconto := v_desconto + 5; END IF;

        -- limita ao maximo permitido (15%)
        -- preparado pra escalar: se no futuro tiver mais criterios de desconto,
        -- o total nunca passa de v_desconto_maximo
        IF v_desconto > v_desconto_maximo THEN
            v_desconto := v_desconto_maximo;
        END IF;
    END IF;

    -- calcula valor total com desconto
    v_valor_total := v_preco * p_quantidade;
    v_valor_total := v_valor_total - (v_valor_total * v_desconto / 100);

    -- desconta estoque
    UPDATE doces d SET estoque = d.estoque - p_quantidade WHERE d.id = p_doce_id;

    -- insere a venda
    RETURN QUERY
    INSERT INTO vendas (cliente_id, doce_id, vendedor_id, quantidade, valor_total,
                        forma_pagamento, status_pagamento)
    VALUES (p_cliente_id, p_doce_id, p_vendedor_id, p_quantidade, v_valor_total,
            p_forma_pagamento, p_status_pagamento)
    RETURNING vendas.id, vendas.cliente_id, vendas.doce_id, vendas.vendedor_id,
              vendas.quantidade, vendas.valor_total, vendas.forma_pagamento,
              vendas.status_pagamento, vendas.data_venda, v_desconto;
END;
$$;
