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
      const { texto, autor, receitaId } = req.body;

      const comentario = new Comentario({
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

      const comentarios = await Comentario.find({ receitaId: receitaId }).sort({ createdAt: -1 });
      const comentariosJSON = comentarios.map((coment) => {
        const obj = coment.toJSON();
        obj.autorInicial = obj.autor
          ? obj.autor.charAt(0).toUpperCase()
          : "?";
        return obj;
      });

      const podeExcluir = req.session.logado || false;

      res.render("comentario/comentarioList", {
        comentarios: comentariosJSON,
        receita,
        receitaId,
        podeExcluir,
      });
    } catch (error) {
      console.error("Erro ao listar comentários:", error);
      res.redirect("/");
    }
  },

  excluir: async (req, res) => {
    try {
      const { id } = req.params;
      const { receitaId } = req.query;

      await Comentario.findByIdAndDelete(id);

      res.redirect(`/comentarioList/${receitaId || ""}`);
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      res.redirect("/");
    }
  },
};

module.exports = controllerComentario;
