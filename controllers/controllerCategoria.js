const { Categoria } = require("../config/db_sequelize");

const controllerCategoria = {
  listar: async (req, res) => {
    try {
      const categorias = await Categoria.findAll({ order: [["nome", "ASC"]], raw: true });
      res.render("categorias/listar", { categorias });
    } catch (error) {
      console.error("Erro ao listar categorias:", error);
      res.render("categorias/listar", { categorias: [], erro: "Erro ao carregar categorias." });
    }
  },

  cadastrarForm: (req, res) => {
    res.render("categorias/cadastrar");
  },

  cadastrar: async (req, res) => {
    try {
      const { nome } = req.body;
      await Categoria.create({ nome });
      res.redirect("/categorias");
    } catch (error) {
      console.error("Erro ao cadastrar categoria:", error);
      res.render("categorias/cadastrar", { erro: "Erro ao cadastrar categoria. Verifique se o nome já existe.", nome: req.body.nome });
    }
  },

  editarForm: async (req, res) => {
    try {
      const categoria = await Categoria.findByPk(req.params.id, { raw: true });
      if (!categoria) return res.redirect("/categorias");
      res.render("categorias/editar", { categoria });
    } catch (error) {
      console.error("Erro ao carregar categoria:", error);
      res.redirect("/categorias");
    }
  },

  editar: async (req, res) => {
    try {
      const { nome } = req.body;
      await Categoria.update({ nome }, { where: { id: req.params.id } });
      res.redirect("/categorias");
    } catch (error) {
      console.error("Erro ao editar categoria:", error);
      res.redirect("/categorias");
    }
  },

  excluir: async (req, res) => {
    try {
      await Categoria.destroy({ where: { id: req.params.id } });
      res.redirect("/categorias");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      res.redirect("/categorias");
    }
  },
};

module.exports = controllerCategoria;
