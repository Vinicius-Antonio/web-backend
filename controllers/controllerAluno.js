const bcrypt = require("bcryptjs");
const { Aluno, Habilidade } = require("../config/db_sequelize");

const controllerAluno = {
  loginForm: (req, res) => {
    if (req.session.logado) {
      return res.redirect("/");
    }
    res.render("login", { layout: "noMenu" });
  },

  login: async (req, res) => {
    try {
      const { login, senha } = req.body;
      const aluno = await Aluno.findOne({ where: { login } });

      if (!aluno) {
        return res.render("login", {
          layout: "noMenu",
          erro: "Login ou senha inválidos.",
        });
      }

      const senhaValida = await bcrypt.compare(senha, aluno.senha);
      if (!senhaValida) {
        return res.render("login", {
          layout: "noMenu",
          erro: "Login ou senha inválidos.",
        });
      }

      req.session.logado = true;
      req.session.usuarioId = aluno.id;
      req.session.login = aluno.login;
      req.session.tipo = aluno.tipo;

      return res.redirect("/");
    } catch (error) {
      console.error("Erro no login:", error);
      return res.render("login", {
        layout: "noMenu",
        erro: "Erro interno ao processar login.",
      });
    }
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error("Erro ao destruir sessão:", err);
      res.redirect("/");
    });
  },

  listar: async (req, res) => {
    try {
      const alunos = await Aluno.findAll({
        order: [["login", "ASC"]],
        raw: true,
      });
      res.render("alunos/listar", { alunos });
    } catch (error) {
      console.error("Erro ao listar alunos:", error);
      res.render("alunos/listar", { alunos: [], erro: "Erro ao carregar alunos." });
    }
  },

  cadastrarForm: (req, res) => {
    res.render("alunos/cadastrar");
  },

  cadastrar: async (req, res) => {
    try {
      const { login, senha, tipo } = req.body;
      const existe = await Aluno.findOne({ where: { login } });
      if (existe) {
        return res.render("alunos/cadastrar", { erro: "Este login já está em uso.", login, tipo });
      }
      const senhaHash = await bcrypt.hash(senha, 10);
      await Aluno.create({ login, senha: senhaHash, tipo: parseInt(tipo) });
      res.redirect("/alunos");
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
      res.render("alunos/cadastrar", { erro: "Erro ao cadastrar aluno." });
    }
  },

  editarForm: async (req, res) => {
    try {
      const aluno = await Aluno.findByPk(req.params.id, { raw: true });
      if (!aluno) return res.redirect("/alunos");
      res.render("alunos/editar", { aluno });
    } catch (error) {
      console.error("Erro ao carregar aluno:", error);
      res.redirect("/alunos");
    }
  },

  editar: async (req, res) => {
    try {
      const { login, senha, tipo } = req.body;
      const aluno = await Aluno.findByPk(req.params.id);
      if (!aluno) return res.redirect("/alunos");
      aluno.login = login;
      aluno.tipo = parseInt(tipo);
      if (senha && senha.trim() !== "") {
        aluno.senha = await bcrypt.hash(senha, 10);
      }
      await aluno.save();
      res.redirect("/alunos");
    } catch (error) {
      console.error("Erro ao editar aluno:", error);
      res.redirect("/alunos");
    }
  },

  excluir: async (req, res) => {
    try {
      const aluno = await Aluno.findByPk(req.params.id);
      if (aluno) await aluno.destroy();
      res.redirect("/alunos");
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      res.redirect("/alunos");
    }
  },
};

module.exports = controllerAluno;
