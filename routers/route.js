const express = require("express");
const router = express.Router();
require("../config/db_mongoose");

const {
  configurarLocals,
  verificarAutenticacao,
  verificarAdmin,
} = require("../middlewares/middlewares");

const controllerAluno = require("../controllers/controllerAluno");
const controllerReceita = require("../controllers/controllerReceita");
const controllerCategoria = require("../controllers/controllerCategoria");
const controllerHabilidade = require("../controllers/controllerHabilidade");
const controllerComentario = require("../controllers/controllerComentario");

router.use(configurarLocals);

router.get("/", controllerReceita.listarPublico);
router.get("/receitas/filtrar", controllerReceita.filtrarPorCategoria);
router.get("/receitas/detalhes/:id", controllerReceita.detalhes);
router.get("/relatorio", controllerHabilidade.relatorio);

router.get("/login", controllerAluno.loginForm);
router.post("/login", controllerAluno.login);
router.get("/logout", controllerAluno.logout);

router.get(
  "/receitas/cadastrar",
  verificarAutenticacao,
  controllerReceita.cadastrarForm
);
router.post(
  "/receitas/cadastrar",
  verificarAutenticacao,
  controllerReceita.cadastrar
);
router.get(
  "/receitas/editar/:id",
  verificarAutenticacao,
  controllerReceita.editarForm
);
router.post(
  "/receitas/editar/:id",
  verificarAutenticacao,
  controllerReceita.editar
);
router.get(
  "/receitas/excluir/:id",
  verificarAutenticacao,
  controllerReceita.excluir
);

router.get(
  "/receitas/minhas",
  verificarAutenticacao,
  controllerReceita.minhasReceitas
);

router.get(
  "/habilidades/minhas",
  verificarAutenticacao,
  controllerHabilidade.minhasHabilidades
);
router.post(
  "/habilidades/minhas",
  verificarAutenticacao,
  controllerHabilidade.salvarMinhasHabilidades
);

router.get("/alunos", verificarAdmin, controllerAluno.listar);
router.get("/alunos/cadastrar", verificarAdmin, controllerAluno.cadastrarForm);
router.post("/alunos/cadastrar", verificarAdmin, controllerAluno.cadastrar);
router.get("/alunos/editar/:id", verificarAdmin, controllerAluno.editarForm);
router.post("/alunos/editar/:id", verificarAdmin, controllerAluno.editar);
router.get("/alunos/excluir/:id", verificarAdmin, controllerAluno.excluir);

router.get("/categorias", verificarAdmin, controllerCategoria.listar);
router.get(
  "/categorias/cadastrar",
  verificarAdmin,
  controllerCategoria.cadastrarForm
);
router.post(
  "/categorias/cadastrar",
  verificarAdmin,
  controllerCategoria.cadastrar
);
router.get(
  "/categorias/editar/:id",
  verificarAdmin,
  controllerCategoria.editarForm
);
router.post(
  "/categorias/editar/:id",
  verificarAdmin,
  controllerCategoria.editar
);
router.get(
  "/categorias/excluir/:id",
  verificarAdmin,
  controllerCategoria.excluir
);

router.get("/habilidades", verificarAdmin, controllerHabilidade.listar);
router.get(
  "/habilidades/cadastrar",
  verificarAdmin,
  controllerHabilidade.cadastrarForm
);
router.post(
  "/habilidades/cadastrar",
  verificarAdmin,
  controllerHabilidade.cadastrar
);
router.get(
  "/habilidades/editar/:id",
  verificarAdmin,
  controllerHabilidade.editarForm
);
router.post(
  "/habilidades/editar/:id",
  verificarAdmin,
  controllerHabilidade.editar
);
router.get(
  "/habilidades/excluir/:id",
  verificarAdmin,
  controllerHabilidade.excluir
);

router.get("/comentarioCreate/:id_receita", controllerComentario.getCreate);
router.post("/comentarioCreate", controllerComentario.postCreate);
router.get("/comentarioList/:id_receita", controllerComentario.getList);

module.exports = router;
