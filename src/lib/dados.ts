// singleton do gerenciador -- preserva dados entre hot reloads do Next.js
import { GerenciadorDoceria } from "../services/GerenciadorDoceria";

const g = globalThis as any;
if (!g.gerenciador) {
  g.gerenciador = new GerenciadorDoceria();
}
const gerenciador: GerenciadorDoceria = g.gerenciador;

export default gerenciador;
