const { Habilidade, Aluno, AlunoHabilidade } = require("../config/db_sequelize");

const controllerHabilidade = {
  listar: async (req, res) => {
    try {
      const habilidades = await Habilidade.findAll({ order: [["nome", "ASC"]], raw: true });
      res.render("habilidades/listar", { habilidades });
    } catch (error) {
      console.error("Erro ao listar habilidades:", error);
      res.render("habilidades/listar", { habilidades: [], erro: "Erro ao carregar habilidades." });
    }
  },

  cadastrarForm: (req, res) => {
    res.render("habilidades/cadastrar");
  },

  cadastrar: async (req, res) => {
    try {
      const { nome } = req.body;
      await Habilidade.create({ nome });
      res.redirect("/habilidades");
    } catch (error) {
      console.error("Erro ao cadastrar habilidade:", error);
      res.render("habilidades/cadastrar", { erro: "Erro ao cadastrar habilidade. Verifique se o nome já existe.", nome: req.body.nome });
    }
  },

  editarForm: async (req, res) => {
    try {
      const habilidade = await Habilidade.findByPk(req.params.id, { raw: true });
      if (!habilidade) return res.redirect("/habilidades");
      res.render("habilidades/editar", { habilidade });
    } catch (error) {
      console.error("Erro ao carregar habilidade:", error);
      res.redirect("/habilidades");
    }
  },

  editar: async (req, res) => {
    try {
      const { nome } = req.body;
      await Habilidade.update({ nome }, { where: { id: req.params.id } });
      res.redirect("/habilidades");
    } catch (error) {
      console.error("Erro ao editar habilidade:", error);
      res.redirect("/habilidades");
    }
  },

  excluir: async (req, res) => {
    try {
      await Habilidade.destroy({ where: { id: req.params.id } });
      res.redirect("/habilidades");
    } catch (error) {
      console.error("Erro ao excluir habilidade:", error);
      res.redirect("/habilidades");
    }
  },

  minhasHabilidades: async (req, res) => {
    try {
      const todasHabilidades = await Habilidade.findAll({ order: [["nome", "ASC"]], raw: true });
      const aluno = await Aluno.findByPk(req.session.usuarioId, {
        include: [{ model: Habilidade, as: "habilidades" }],
      });
      const alunoHabilidades = aluno ? aluno.habilidades.map((h) => h.get({ plain: true })) : [];

      const habilidadesComNivel = todasHabilidades.map((h) => {
        const vinculada = alunoHabilidades.find((ah) => ah.id === h.id);
        return {
          ...h,
          nivel: vinculada ? vinculada.AlunoHabilidade.nivel : 0,
          vinculada: !!vinculada,
        };
      });

      res.render("habilidades/minhas", { habilidades: habilidadesComNivel });
    } catch (error) {
      console.error("Erro ao carregar habilidades:", error);
      res.render("habilidades/minhas", { habilidades: [], erro: "Erro ao carregar habilidades." });
    }
  },

  salvarMinhasHabilidades: async (req, res) => {
    try {
      const aluno = await Aluno.findByPk(req.session.usuarioId);
      if (!aluno) return res.redirect("/");

      const todasHabilidades = await Habilidade.findAll({ raw: true });
      await aluno.setHabilidades([]);

      for (const hab of todasHabilidades) {
        const nivel = parseInt(req.body[`nivel_${hab.id}`]) || 0;
        if (nivel > 0) {
          await aluno.addHabilidade(hab.id, {
            through: { nivel: Math.min(Math.max(nivel, 0), 10) },
          });
        }
      }

      res.redirect("/habilidades/minhas");
    } catch (error) {
      console.error("Erro ao salvar habilidades:", error);
      res.redirect("/habilidades/minhas");
    }
  },

  relatorio: async (req, res) => {
    try {
      const habilidades = await Habilidade.findAll({
        include: [{ model: Aluno, as: "alunos", attributes: ["id", "login"] }],
        order: [["nome", "ASC"]],
      });
      const totalAlunos = await Aluno.count({ where: { tipo: 1 } });

      const dados = habilidades.map((h) => {
        const plain = h.get({ plain: true });
        const alunosComHabilidade = plain.alunos.length;
        const proporcao = totalAlunos > 0 ? ((alunosComHabilidade / totalAlunos) * 100).toFixed(1) : 0;

        let somaNiveis = 0;
        plain.alunos.forEach((a) => { somaNiveis += a.AlunoHabilidade.nivel; });
        const mediaNivel = alunosComHabilidade > 0 ? (somaNiveis / alunosComHabilidade).toFixed(1) : 0;

        return { nome: plain.nome, totalAlunos: alunosComHabilidade, proporcao, mediaNivel };
      });

      res.render("relatorio", { dados, totalAlunos });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      res.render("relatorio", { dados: [], totalAlunos: 0, erro: "Erro ao gerar relatório." });
    }
  },
};

module.exports = controllerHabilidade;
