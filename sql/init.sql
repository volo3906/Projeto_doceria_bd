-- Schema da Doceria Gourmet — BD1

CREATE TABLE doces (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    fabricado_em_mari BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(13) NOT NULL,
    torce_flamengo BOOLEAN NOT NULL DEFAULT false,
    assiste_one_piece BOOLEAN NOT NULL DEFAULT false,
    de_sousa BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE vendedores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(13) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    doce_id INTEGER NOT NULL REFERENCES doces(id) ON DELETE RESTRICT,
    vendedor_id INTEGER NOT NULL REFERENCES vendedores(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor_total NUMERIC(10, 2) NOT NULL CHECK (valor_total >= 0),
    forma_pagamento VARCHAR(20) NOT NULL CHECK (forma_pagamento IN ('cartao', 'boleto', 'pix', 'berries', 'dinheiro')),
    status_pagamento VARCHAR(20) CHECK (status_pagamento IN ('confirmado', 'pendente', 'recusado')),
    data_venda TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE VIEW vw_clientes_flamengo_onepiece_desousa AS SELECT 
id, 
nome, 
cpf, 
email, 
telefone, 
torce_flamengo, 
assiste_one_piece, 
de_sousa, 
criado_em 
FROM clientes 
WHERE torce_flamengo = true OR assiste_one_piece = true OR de_sousa = true OR nome ILIKE '%de Sousa%';

-- dados iniciais para demonstracao
INSERT INTO doces (nome, categoria, preco, estoque, fabricado_em_mari) VALUES
('Brigadeiro', 'Chocolate', 4.00, 50, false),
('Beijinho', 'Coco', 3.50, 40, true),
('Cajuzinho', 'Castanha', 4.50, 30, false),
('Cocada', 'Coco', 5.00, 25, true),
('Trufa de Morango', 'Chocolate', 6.00, 20, false);

INSERT INTO clientes (nome, cpf, email, telefone, torce_flamengo, assiste_one_piece, de_sousa) VALUES
('Joao Silva', '12345678900', 'joao@email.com', '5583999990001', true, false, false),
('Maria Oliveira', '98765432100', 'maria@email.com', '5583999990002', false, true, true),
('Pedro Santos', '11122233344', 'pedro@email.com', '5583999990003', false, false, false);

INSERT INTO vendedores (nome, cpf, email, telefone) VALUES
('Ana Silva', '11111111111', 'ana@doceria.com', '5583988880001'),
('Carlos Souza', '22222222222', 'carlos@doceria.com', '5583988880002'),
('Lucia Martins', '33333333333', 'lucia@doceria.com', '5583988880003');
