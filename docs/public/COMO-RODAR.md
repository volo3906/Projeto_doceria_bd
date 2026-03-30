# Como Rodar o Projeto

Guia para subir o sistema Doceria Gourmet no localhost.

---

## Pre-requisitos

- **Node.js** versao 18 ou superior (recomendado: 22+)
- **npm** (ja vem junto com o Node.js)
- **Docker** e **Docker Compose** (para rodar o PostgreSQL)

Para verificar se ja tem instalado:

```bash
node -v
npm -v
docker --version
docker compose version
```

Se nao tiver Node.js, baixe em: https://nodejs.org (usar a versao LTS)

Se nao tiver Docker, baixe em: https://docs.docker.com/get-docker/

> **Nota:** se voce esta conectando em um banco PostgreSQL remoto (ex: na VPS de outro membro do grupo), **nao precisa** instalar Docker. Basta configurar o `.env` com o IP do servidor.

---

## Passo a Passo

### 1. Clonar o repositorio

```bash
git clone https://github.com/volo3906/Projeto_doceria_bd.git
cd Projeto_doceria_bd
```

### 2. Instalar as dependencias

```bash
npm install
```

Isso vai criar a pasta `node_modules/` com todas as bibliotecas necessarias. Pode demorar um pouco na primeira vez.

### 3. Configurar o banco de dados

Copie o arquivo de template e preencha com as credenciais:

```bash
cp .env.example .env
```

Edite o `.env` e troque `TROCAR_PELA_SENHA_REAL` pela senha real do banco.

Se voce esta rodando o banco **localmente** (Docker na sua maquina):

```bash
# subir o PostgreSQL
docker compose up -d

# verificar se subiu
docker compose ps
```

Se voce esta conectando em um banco **remoto** (VPS), troque `localhost` pelo IP do servidor no `DATABASE_URL` do `.env`.

### 4. Rodar migrations (se o banco ja existia)

Se o banco ja foi criado antes e voce esta atualizando o projeto, rode as migrations pra aplicar as mudancas no schema sem perder dados:

```bash
node scripts/migrate.mjs
```

Se o banco e novo (acabou de criar com `docker compose up -d`), o `init.sql` ja cria tudo e **nao precisa rodar migrations**.

### 5. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Vai aparecer algo assim no terminal:

```
  ▲ Next.js 16.1.6
  - Local:    http://localhost:3303
  - Network:  http://192.168.x.x:3303

 ✓ Starting...
 ✓ Ready in 2.5s
```

### 6. Abrir no navegador

Acesse: **http://localhost:3303**

Pronto! O sistema vai abrir com o dashboard da Doceria Gourmet.

---

## Rodando em outra porta

Se a porta 3303 ja estiver em uso, rode em outra porta:

```bash
npm run dev -- -p 4000
```

Ai o acesso fica em: **http://localhost:4000**

---

## Navegacao

O sistema tem 6 paginas acessiveis pelo menu lateral:

| Pagina | URL | O que faz |
|--------|-----|-----------|
| Inicio | `/` | Dashboard com resumo geral |
| Doces | `/doces` | Cadastrar, editar, pesquisar e remover doces |
| Clientes | `/clientes` | Cadastrar, editar, pesquisar e remover clientes |
| Vendedores | `/vendedores` | Cadastrar, editar e remover vendedores |
| Vendas | `/vendas` | Registrar vendas (com preview de desconto) e ver historico |
| Relatorios | `/relatorios` | Relatorios de estoque, clientes e vendas |

---

## Testando a API direto (opcional)

Se quiser testar os endpoints sem usar a interface, pode usar `curl` no terminal:

```bash
# listar todos os doces
curl http://localhost:3303/api/doces

# cadastrar um doce
curl -X POST http://localhost:3303/api/doces \
  -H "Content-Type: application/json" \
  -d '{"nome":"Brigadeiro","categoria":"Chocolate","preco":4,"estoque":50}'

# listar todos os clientes
curl http://localhost:3303/api/clientes

# cadastrar um cliente
curl -X POST http://localhost:3303/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Joao","cpf":"123.456.789-00","email":"joao@email.com","telefone":"(83) 99999-0001"}'

# registrar uma venda (precisa de vendedor e forma de pagamento)
curl -X POST http://localhost:3303/api/vendas \
  -H "Content-Type: application/json" \
  -d '{"clienteId":1,"doceId":1,"vendedorId":1,"quantidade":5,"formaPagamento":"pix","statusPagamento":"pendente"}'

# ver relatorio geral
curl http://localhost:3303/api/relatorio
```

---

## Observacoes Importantes

- **Dados persistentes**: os dados ficam no PostgreSQL. Mesmo que voce pare o `npm run dev` (Ctrl+C) e inicie de novo, todos os dados continuam la. Para resetar os dados, precisa recriar o container: `docker compose down -v && docker compose up -d`.

- **Migrations**: se puxou codigo novo do repositorio e o banco ja existia, rode `node scripts/migrate.mjs` pra aplicar mudancas no schema sem perder dados.

- **Hot reload**: durante o desenvolvimento, quando voce edita um arquivo e salva, o navegador atualiza automaticamente.

- **Erros de porta em uso**: se aparecer `EADDRINUSE`, significa que algo ja esta usando a porta. Pode matar o processo anterior:
  ```bash
  # no Linux/Mac
  lsof -ti:3303 | xargs kill

  # ou rode em outra porta
  npm run dev -- -p 4000
  ```

- **Banco nao conecta**: verifique se o container Docker esta rodando (`docker compose ps`) e se o `.env` tem as credenciais corretas. Se estiver conectando remotamente, verifique se o IP e a porta estao corretos.

---

## Estrutura Rapida

```
Projeto_doceria_bd/
├── docker-compose.yml  ← container PostgreSQL
├── sql/init.sql        ← schema + dados iniciais
├── .env.example        ← template de credenciais
└── src/
    ├── models/         ← classes OOP (Doce, Cliente, Venda, Vendedor)
    ├── services/       ← GerenciadorDoceria (queries SQL + stored procedure)
    ├── lib/            ← pool de conexao, singleton, types, utils de formatacao
    ├── app/
    │   ├── api/        ← endpoints REST
    │   ├── page.tsx    ← pagina Home
    │   ├── doces/      ← pagina de Doces
    │   ├── clientes/   ← pagina de Clientes
    │   ├── vendedores/ ← pagina de Vendedores
    │   ├── vendas/     ← pagina de Vendas
    │   └── relatorios/ ← pagina de Relatorios
    └── components/     ← componentes React reutilizaveis
```

Para detalhes do banco de dados, veja `docs/public/database/BANCO-DE-DADOS.md`.
