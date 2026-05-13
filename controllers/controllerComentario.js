const Comentario = require("../models/noSql/comentario");
const { Receita } = require("../config/db_sequelize");

const controllerComentario = {
  getCreate: async (req, res) => {
    try {
      const receita = await Receita.findByPk(req.params.id_receita, { raw: true });
      if (!receita) return res.redirect("/");

      res.render("comentario/comentarioCreate", {
        receitaId: receita.id,
        receitaNome: receita.nome,
        autor: req.session.login || "",
      });
    } catch (error) {
      console.error("Erro ao carregar formulário de comentário:", error);
      res.redirect("/");
    }
  },

  postCreate: async (req, res) => {
    try {
      const { titulo, texto, autor, receitaId } = req.body;

      const comentario = new Comentario({
        titulo,
        texto,
        autor,
        receitaId: parseInt(receitaId),
      });

      await comentario.save();
      res.redirect(`/comentarioList/${receitaId}`);
    } catch (error) {
      console.error("Erro ao salvar comentário:", error);
      res.redirect(`/comentarioCreate/${req.body.receitaId || ""}`);
    }
  },

  getList: async (req, res) => {
    try {
      const receitaId = req.params.id_receita;
      const receita = await Receita.findByPk(receitaId, { raw: true });
      if (!receita) return res.redirect("/");

      const comentarios = await Comentario.find({ receitaId: receitaId });
      const comentariosJSON = comentarios.map((coment) => coment.toJSON());

      res.render("comentario/comentarioList", {
        comentarios: comentariosJSON,
        receita,
        receitaId,
      });
    } catch (error) {
      console.error("Erro ao listar comentários:", error);
      res.redirect("/");
    }
  },
};

module.exports = controllerComentario;
