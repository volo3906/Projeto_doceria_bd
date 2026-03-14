import * as readline from "readline";
import { GerenciadorDoceria } from "./services/GerenciadorDoceria";

const doceria = new GerenciadorDoceria();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  let sair = false;

  while (!sair) {
    console.log("\n=========== DOCERIA GOURMET ===========");
    console.log("1. Cadastrar Doce");
    console.log("2. Listar Estoque");
    console.log("3. Buscar por Categoria");
    console.log("4. Alterar Preco/Estoque");
    console.log("5. Aplicar Desconto Especial");
    console.log("6. Realizar Venda");
    console.log("7. Relatorio Financeiro");
    console.log("8. Remover Doce");
    console.log("9. Cadastrar Cliente");
    console.log("10. Listar Clientes");
    console.log("0. Sair");

    const escolha = await question("Escolha: ");
    const opcao = parseInt(escolha);

    switch (opcao) {
      case 1: {
        const n = await question("Nome: ");
        const c = await question("Categoria: ");
        const pStr = await question("Preco: ");
        const qStr = await question("Qtd Inicial: ");
        doceria.criarDoce(n, c, parseFloat(pStr), parseInt(qStr));
        break;
      }
      case 2:
        doceria.listarTodos();
        break;
      case 3: {
        const cat = await question("Digite a categoria: ");
        doceria.buscarPorCategoria(cat);
        break;
      }
      case 4: {
        const idStr = await question("ID do Doce: ");
        const nPStr = await question("Novo Preco: ");
        const nQStr = await question("Nova Qtd: ");
        if (
          doceria.atualizarDoce(
            parseInt(idStr),
            parseFloat(nPStr),
            parseInt(nQStr)
          )
        ) {
          console.log("Atualizado!");
        } else {
          console.log("Doce nao encontrado.");
        }
        break;
      }
      case 5: {
        const idStr = await question("ID do Doce para desconto: ");
        const d = doceria.lerDoce(parseInt(idStr));
        if (d) {
          const descStr = await question("Porcentagem de desconto (ex: 10): ");
          d.aplicarDesconto(parseFloat(descStr));
        } else {
          console.log("ID invalido.");
        }
        break;
      }
      case 6: {
        const idClienteStr = await question("ID do Cliente: ");
        const idDoceStr = await question("ID do Doce: ");
        const qtdStr = await question("Quantidade: ");
        doceria.registrarVenda(
          parseInt(idClienteStr),
          parseInt(idDoceStr),
          parseInt(qtdStr),
          new Date().toLocaleDateString("pt-BR")
        );
        break;
      }
      case 7:
        doceria.exibirRelatorioFinanceiro();
        break;
      case 8: {
        const idStr = await question("ID para remover: ");
        if (!doceria.deletarDoce(parseInt(idStr))) {
          console.log("Erro ao remover.");
        }
        break;
      }
      case 9: {
        const nome = await question("Nome: ");
        const cpf = await question("CPF: ");
        const email = await question("Email: ");
        doceria.cadastrarCliente(nome, cpf, email);
        break;
      }
      case 10:
        doceria.listarClientes();
        break;
      case 0:
        console.log("Encerrando sistema...");
        sair = true;
        rl.close();
        break;
      default:
        console.log("Opcao invalida.");
    }
  }
}

main().catch((err) => {
  console.error("Erro no sistema:", err);
  rl.close();
});
