# Como Rodar o Projeto

Guia para subir o sistema Doceria Gourmet no localhost.

---

## Pre-requisitos

- **Node.js** versao 18 ou superior (recomendado: 22+)
- **npm** (ja vem junto com o Node.js)

Para verificar se ja tem instalado:

```bash
node -v
npm -v
```

Se nao tiver, baixe em: https://nodejs.org (usar a versao LTS)

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

### 3. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Vai aparecer algo assim no terminal:

```
  ▲ Next.js 16.1.6
  - Local:    http://localhost:3000
  - Network:  http://192.168.x.x:3000

 ✓ Starting...
 ✓ Ready in 2.5s
```

### 4. Abrir no navegador

Acesse: **http://localhost:3000**

Pronto! O sistema vai abrir com o dashboard da Doceria Gourmet.

---

## Rodando em outra porta

Se a porta 3000 ja estiver em uso, rode em outra porta:

```bash
npm run dev -- -p 3303
```

Ai o acesso fica em: **http://localhost:3303**

---

## Navegacao

O sistema tem 5 paginas acessiveis pelo menu lateral:

| Pagina | URL | O que faz |
|--------|-----|-----------|
| Inicio | `/` | Dashboard com resumo geral |
| Doces | `/doces` | Cadastrar, editar, pesquisar e remover doces |
| Clientes | `/clientes` | Cadastrar, editar, pesquisar e remover clientes |
| Vendas | `/vendas` | Registrar vendas e ver historico |
| Relatorios | `/relatorios` | Relatorios de estoque, clientes e vendas |

---

## Testando a API direto (opcional)

Se quiser testar os endpoints sem usar a interface, pode usar `curl` no terminal:

```bash
# listar todos os doces
curl http://localhost:3000/api/doces

# cadastrar um doce
curl -X POST http://localhost:3000/api/doces \
  -H "Content-Type: application/json" \
  -d '{"nome":"Brigadeiro","categoria":"Chocolate","preco":4,"estoque":50}'

# listar todos os clientes
curl http://localhost:3000/api/clientes

# cadastrar um cliente
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Joao","cpf":"123.456.789-00","email":"joao@email.com","telefone":"(83) 99999-0001"}'

# registrar uma venda
curl -X POST http://localhost:3000/api/vendas \
  -H "Content-Type: application/json" \
  -d '{"clienteId":1,"doceId":1,"quantidade":5}'

# ver relatorio geral
curl http://localhost:3000/api/relatorio
```

---

## Observacoes Importantes

- **Dados em memoria**: os dados ficam na memoria do servidor. Quando voce para o `npm run dev` (Ctrl+C) e inicia de novo, todos os dados sao perdidos. Futuramente vamos usar PostgreSQL para persistir os dados.

- **Hot reload**: durante o desenvolvimento, quando voce edita um arquivo e salva, o navegador atualiza automaticamente. Os dados em memoria sao preservados enquanto o servidor estiver rodando.

- **Erros de porta em uso**: se aparecer `EADDRINUSE`, significa que algo ja esta usando a porta. Pode matar o processo anterior:
  ```bash
  # no Linux/Mac
  lsof -ti:3000 | xargs kill

  # ou rode em outra porta
  npm run dev -- -p 3303
  ```

---

## Estrutura Rapida

```
src/
├── models/          ← classes OOP (Doce, Cliente, Venda)
├── services/        ← GerenciadorDoceria (logica de negocio)
├── lib/             ← singleton, types, utils
├── app/
│   ├── api/         ← endpoints REST
│   ├── page.tsx     ← pagina Home
│   ├── doces/       ← pagina de Doces
│   ├── clientes/    ← pagina de Clientes
│   ├── vendas/      ← pagina de Vendas
│   └── relatorios/  ← pagina de Relatorios
└── components/      ← componentes React reutilizaveis
```

Para mais detalhes sobre o que foi implementado, veja `docs/public/CHANGELOG-interface-web.md`.
