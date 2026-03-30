-- Migration 005: criar indices nas FKs de vendas
-- Data: 2026-03-30
-- PostgreSQL nao cria indice automatico pra FK, so pra PK e UNIQUE.
-- Sem esses indices, qualquer consulta por cliente/doce/vendedor na tabela
-- de vendas faz sequential scan (le tudo). Com eles, vai direto.

CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_doce_id ON vendas(doce_id);
CREATE INDEX IF NOT EXISTS idx_vendas_vendedor_id ON vendas(vendedor_id);
