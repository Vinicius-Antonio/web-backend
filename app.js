const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const path = require("path");

const db = require("./config/db_sequelize");
const routes = require("./routers/route");

const app = express();
const PORT = process.env.PORT || 3000;

app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    helpers: {
      eq: (a, b) => a == b,
      includes: (array, value) => {
        if (!array) return false;
        return array.some((item) => item == value);
      },
      getNivel: (habilidades, habilidadeId) => {
        if (!habilidades) return 0;
        const found = habilidades.find((h) => h.id == habilidadeId);
        if (found && found.AlunoHabilidade) {
          return found.AlunoHabilidade.nivel;
        }
        return 0;
      },
      json: (context) => JSON.stringify(context),
      nivelOptions: (selectedNivel) => {
        let html = "";
        for (let i = 0; i <= 10; i++) {
          const selected = i == selectedNivel ? "selected" : "";
          html += `<option value="${i}" ${selected}>${i}</option>`;
        }
        return html;
      },
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "utfpr-receitas-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1800000 },
  })
);

app.use("/", routes);

db.sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("✅ Banco de dados sincronizado com sucesso.");

    const Aluno = require("./models/relational/aluno");
    const bcrypt = require("bcryptjs");
    const adminExiste = await Aluno.findOne({ where: { login: "admin" } });
    if (!adminExiste) {
      const senhaHash = await bcrypt.hash("admin123", 10);
      await Aluno.create({ login: "admin", senha: senhaHash, tipo: 2 });
      console.log(
        '👤 Admin padrão criado (login: "admin", senha: "admin123").'
      );
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao sincronizar banco de dados:", err);
  });


  