-- Migration 002: criar views da parte 2
-- Data: 2026-03-30

-- clientes que possuem algum criterio de desconto
CREATE OR REPLACE VIEW vw_clientes_com_desconto AS
SELECT id, nome, cpf, email, telefone,
       torce_flamengo, assiste_one_piece, de_sousa, criado_em
FROM clientes
WHERE torce_flamengo = true
   OR assiste_one_piece = true
   OR de_sousa = true;
