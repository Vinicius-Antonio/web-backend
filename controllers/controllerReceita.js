const { Receita, Categoria, Aluno } = require("../config/db_sequelize");
const fs = require("fs");
const path = require("path");

const controllerReceita = {
  listarPublico: async (req, res) => {
    try {
      const categorias = await Categoria.findAll({ order: [["nome", "ASC"]], raw: true });
      const receitas = await Receita.findAll({
        include: [
          { model: Categoria, as: "categorias" },
          { model: Aluno, as: "responsaveis", attributes: ["id", "login"] },
        ],
        order: [["nome", "ASC"]],
      });
      const receitasPlain = receitas.map((r) => r.get({ plain: true }));
      res.render("home", { receitas: receitasPlain, categorias });
    } catch (error) {
      console.error("Erro ao listar receitas:", error);
      res.render("home", { receitas: [], categorias: [], erro: "Erro ao carregar receitas." });
    }
  },

  filtrarPorCategoria: async (req, res) => {
    try {
      const { categoria_id } = req.query;
      const categorias = await Categoria.findAll({ order: [["nome", "ASC"]], raw: true });
      let receitas;

      if (categoria_id && categoria_id !== "") {
        const categoria = await Categoria.findByPk(categoria_id, {
          include: [{
            model: Receita, as: "receitas",
            include: [
              { model: Categoria, as: "categorias" },
              { model: Aluno, as: "responsaveis", attributes: ["id", "login"] },
            ],
          }],
        });
        receitas = categoria ? categoria.receitas.map((r) => r.get({ plain: true })) : [];
      } else {
        const todas = await Receita.findAll({
          include: [
            { model: Categoria, as: "categorias" },
            { model: Aluno, as: "responsaveis", attributes: ["id", "login"] },
          ],
          order: [["nome", "ASC"]],
        });
        receitas = todas.map((r) => r.get({ plain: true }));
      }

      const categoriasComSelecao = categorias.map((c) => ({ ...c, selected: c.id == categoria_id }));
      res.render("home", { receitas, categorias: categoriasComSelecao, filtroAtivo: !!categoria_id });
    } catch (error) {
      console.error("Erro ao filtrar receitas:", error);
      res.redirect("/");
    }
  },

  detalhes: async (req, res) => {
    try {
      const receita = await Receita.findByPk(req.params.id, {
        include: [
          { model: Categoria, as: "categorias" },
          { model: Aluno, as: "responsaveis", attributes: ["id", "login"] },
        ],
      });
      if (!receita) return res.redirect("/");
      res.render("receitas/detalhes", { receita: receita.get({ plain: true }) });
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      res.redirect("/");
    }
  },

  minhasReceitas: async (req, res) => {
    try {
      const aluno = await Aluno.findByPk(req.session.usuarioId, {
        include: [{ model: Receita, as: "receitas", include: [{ model: Categoria, as: "categorias" }] }],
      });
      const receitas = aluno ? aluno.receitas.map((r) => r.get({ plain: true })) : [];
      res.render("receitas/listar", { receitas, minhas: true });
    } catch (error) {
      console.error("Erro ao listar minhas receitas:", error);
      res.render("receitas/listar", { receitas: [], minhas: true, erro: "Erro ao carregar suas receitas." });
    }
  },

  cadastrarForm: async (req, res) => {
    try {
      const categorias = await Categoria.findAll({ order: [["nome", "ASC"]], raw: true });
      const alunos = await Aluno.findAll({ order: [["login", "ASC"]], raw: true, attributes: ["id", "login"] });
      res.render("receitas/cadastrar", { categorias, alunos });
    } catch (error) {
      console.error("Erro ao carregar formulário:", error);
      res.redirect("/receitas/minhas");
    }
  },

  cadastrar: async (req, res) => {
    try {
      const { nome, descricao, link_externo, categorias, responsaveis } = req.body;

      // Pega o nome do arquivo se foi enviada uma imagem
      const imagem = req.file ? req.file.filename : null;

      const receita = await Receita.create({ nome, descricao, link_externo, imagem });

      if (categorias) {
        const catIds = Array.isArray(categorias) ? categorias : [categorias];
        await receita.setCategorias(catIds);
      }

      let respIds = [req.session.usuarioId];
      if (responsaveis) {
        const extras = Array.isArray(responsaveis) ? responsaveis : [responsaveis];
        respIds = [...new Set([...respIds, ...extras.map(Number)])];
      }
      await receita.setResponsaveis(respIds);
      res.redirect("/receitas/minhas");
    } catch (error) {
      console.error("Erro ao cadastrar receita:", error);
      res.redirect("/receitas/cadastrar");
    }
  },

  editarForm: async (req, res) => {
    try {
      const receita = await Receita.findByPk(req.params.id, {
        include: [
          { model: Categoria, as: "categorias" },
          { model: Aluno, as: "responsaveis", attributes: ["id", "login"] },
        ],
      });
      if (!receita) return res.redirect("/receitas/minhas");

      const ehResponsavel = receita.responsaveis.some((r) => r.id === req.session.usuarioId);
      if (!ehResponsavel && req.session.tipo !== 2) return res.redirect("/receitas/minhas");

      const categorias = await Categoria.findAll({ order: [["nome", "ASC"]], raw: true });
      const alunos = await Aluno.findAll({ order: [["login", "ASC"]], raw: true, attributes: ["id", "login"] });

      const receitaPlain = receita.get({ plain: true });
      const categoriasIds = receitaPlain.categorias.map((c) => c.id);
      const responsaveisIds = receitaPlain.responsaveis.map((r) => r.id);

      const categoriasComSelecao = categorias.map((c) => ({ ...c, selecionada: categoriasIds.includes(c.id) }));
      const alunosComSelecao = alunos.map((a) => ({ ...a, selecionado: responsaveisIds.includes(a.id) }));

      res.render("receitas/editar", { receita: receitaPlain, categorias: categoriasComSelecao, alunos: alunosComSelecao });
    } catch (error) {
      console.error("Erro ao carregar edição:", error);
      res.redirect("/receitas/minhas");
    }
  },

  editar: async (req, res) => {
    try {
      const receita = await Receita.findByPk(req.params.id, {
        include: [{ model: Aluno, as: "responsaveis" }],
      });
      if (!receita) return res.redirect("/receitas/minhas");

      const ehResponsavel = receita.responsaveis.some((r) => r.id === req.session.usuarioId);
      if (!ehResponsavel && req.session.tipo !== 2) return res.redirect("/receitas/minhas");

      const { nome, descricao, link_externo, categorias, responsaveis, remover_imagem } = req.body;
      const dadosUpdate = { nome, descricao, link_externo };

      // Se enviou nova imagem, apaga a antiga e salva a nova
      if (req.file) {
        if (receita.imagem) {
          const caminhoAntigo = path.join(__dirname, "..", "public", "uploads", receita.imagem);
          if (fs.existsSync(caminhoAntigo)) fs.unlinkSync(caminhoAntigo);
        }
        dadosUpdate.imagem = req.file.filename;
      }

      // Se marcou para remover imagem
      if (remover_imagem === "1" && !req.file) {
        if (receita.imagem) {
          const caminhoAntigo = path.join(__dirname, "..", "public", "uploads", receita.imagem);
          if (fs.existsSync(caminhoAntigo)) fs.unlinkSync(caminhoAntigo);
        }
        dadosUpdate.imagem = null;
      }

      await receita.update(dadosUpdate);

      if (categorias) {
        const catIds = Array.isArray(categorias) ? categorias : [categorias];
        await receita.setCategorias(catIds);
      } else {
        await receita.setCategorias([]);
      }

      if (responsaveis) {
        const respIds = Array.isArray(responsaveis) ? responsaveis : [responsaveis];
        await receita.setResponsaveis(respIds.map(Number));
      }
      res.redirect("/receitas/minhas");
    } catch (error) {
      console.error("Erro ao editar receita:", error);
      res.redirect("/receitas/minhas");
    }
  },

  excluir: async (req, res) => {
    try {
      const receita = await Receita.findByPk(req.params.id, {
        include: [{ model: Aluno, as: "responsaveis" }],
      });
      if (!receita) return res.redirect("/receitas/minhas");

      const ehResponsavel = receita.responsaveis.some((r) => r.id === req.session.usuarioId);
      if (!ehResponsavel && req.session.tipo !== 2) return res.redirect("/receitas/minhas");

      // Remove a imagem do disco ao excluir a receita
      if (receita.imagem) {
        const caminhoImagem = path.join(__dirname, "..", "public", "uploads", receita.imagem);
        if (fs.existsSync(caminhoImagem)) fs.unlinkSync(caminhoImagem);
      }

      await receita.setCategorias([]);
      await receita.setResponsaveis([]);
      await receita.destroy();
      res.redirect("/receitas/minhas");
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
      res.redirect("/receitas/minhas");
    }
  },
};

module.exports = controllerReceita;
