-- Migration 001: normalizar CPF e telefone para somente digitos
-- Data: 2026-03-30

-- trata duplicatas de CPF que vao conflitar apos normalizacao
-- se tem um formatado (123.456.789-00) e um limpo (12345678900):
-- 1. move as vendas do formatado pro limpo
-- 2. deleta o formatado

-- move vendas de clientes duplicados (formatado → limpo)
UPDATE vendas SET cliente_id = c_limpo.id
FROM clientes c_fmt, clientes c_limpo
WHERE vendas.cliente_id = c_fmt.id
AND c_fmt.id != c_limpo.id
AND REGEXP_REPLACE(c_fmt.cpf, '\D', '', 'g') = c_limpo.cpf
AND LENGTH(c_fmt.cpf) > LENGTH(c_limpo.cpf);

-- agora deleta os clientes duplicados formatados (ja sem vendas)
DELETE FROM clientes
WHERE id IN (
    SELECT c1.id FROM clientes c1
    WHERE EXISTS (
        SELECT 1 FROM clientes c2
        WHERE c2.id != c1.id
        AND REGEXP_REPLACE(c1.cpf, '\D', '', 'g') = REGEXP_REPLACE(c2.cpf, '\D', '', 'g')
        AND LENGTH(c1.cpf) > LENGTH(c2.cpf)
    )
);

-- mesma logica pra vendedores
UPDATE vendas SET vendedor_id = v_limpo.id
FROM vendedores v_fmt, vendedores v_limpo
WHERE vendas.vendedor_id = v_fmt.id
AND v_fmt.id != v_limpo.id
AND REGEXP_REPLACE(v_fmt.cpf, '\D', '', 'g') = v_limpo.cpf
AND LENGTH(v_fmt.cpf) > LENGTH(v_limpo.cpf);

DELETE FROM vendedores
WHERE id IN (
    SELECT v1.id FROM vendedores v1
    WHERE EXISTS (
        SELECT 1 FROM vendedores v2
        WHERE v2.id != v1.id
        AND REGEXP_REPLACE(v1.cpf, '\D', '', 'g') = REGEXP_REPLACE(v2.cpf, '\D', '', 'g')
        AND LENGTH(v1.cpf) > LENGTH(v2.cpf)
    )
);

-- normaliza CPFs (remove pontos, tracos, etc)
UPDATE clientes SET cpf = REGEXP_REPLACE(cpf, '\D', '', 'g');
UPDATE vendedores SET cpf = REGEXP_REPLACE(cpf, '\D', '', 'g');

-- normaliza telefones
UPDATE clientes SET telefone = REGEXP_REPLACE(telefone, '\D', '', 'g');
UPDATE vendedores SET telefone = REGEXP_REPLACE(telefone, '\D', '', 'g');

-- ajusta tamanho das colunas
ALTER TABLE clientes ALTER COLUMN cpf TYPE VARCHAR(11);
ALTER TABLE clientes ALTER COLUMN telefone TYPE VARCHAR(13);
ALTER TABLE vendedores ALTER COLUMN cpf TYPE VARCHAR(11);
ALTER TABLE vendedores ALTER COLUMN telefone TYPE VARCHAR(13);
