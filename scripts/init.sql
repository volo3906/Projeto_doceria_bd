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
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    torce_flamengo BOOLEAN NOT NULL DEFAULT false,
    assiste_one_piece BOOLEAN NOT NULL DEFAULT false,
    de_sousa BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    doce_id INTEGER NOT NULL REFERENCES doces(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor_total NUMERIC(10, 2) NOT NULL CHECK (valor_total >= 0),
    data_venda TIMESTAMP NOT NULL DEFAULT NOW()
);

-- dados iniciais para demonstracao
INSERT INTO doces (nome, categoria, preco, estoque, fabricado_em_mari) VALUES
('Brigadeiro', 'Chocolate', 4.00, 50, false),
('Beijinho', 'Coco', 3.50, 40, true),
('Cajuzinho', 'Castanha', 4.50, 30, false),
('Cocada', 'Coco', 5.00, 25, true),
('Trufa de Morango', 'Chocolate', 6.00, 20, false);

INSERT INTO clientes (nome, cpf, email, telefone, torce_flamengo, assiste_one_piece, de_sousa) VALUES
('Joao Silva', '123.456.789-00', 'joao@email.com', '(83) 99999-0001', true, false, false),
('Maria Oliveira', '987.654.321-00', 'maria@email.com', '(83) 99999-0002', false, true, true),
('Pedro Santos', '111.222.333-44', 'pedro@email.com', '(83) 99999-0003', false, false, false);
