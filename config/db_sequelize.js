require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT || 5432,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

const Aluno = sequelize.define(
  "Aluno",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    login: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isIn: [[1, 2]],
      },
    },
  },
  {
    tableName: "alunos",
  }
);

const Receita = sequelize.define(
  "Receita",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link_externo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    imagem: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    modo_preparo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "receitas",
  }
);

const Categoria = sequelize.define(
  "Categoria",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "categorias",
  }
);

const Habilidade = sequelize.define(
  "Habilidade",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "habilidades",
  }
);

const AlunoHabilidade = sequelize.define(
  "AlunoHabilidade",
  {
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 10 },
    },
  },
  {
    tableName: "AlunoHabilidade",
    timestamps: false,
  }
);

Receita.belongsToMany(Categoria, {
  through: "ReceitaCategoria",
  foreignKey: "receita_id",
  otherKey: "categoria_id",
  as: "categorias",
});
Categoria.belongsToMany(Receita, {
  through: "ReceitaCategoria",
  foreignKey: "categoria_id",
  otherKey: "receita_id",
  as: "receitas",
});

Receita.belongsToMany(Aluno, {
  through: "ReceitaAluno",
  foreignKey: "receita_id",
  otherKey: "aluno_id",
  as: "responsaveis",
});
Aluno.belongsToMany(Receita, {
  through: "ReceitaAluno",
  foreignKey: "aluno_id",
  otherKey: "receita_id",
  as: "receitas",
});

Aluno.belongsToMany(Habilidade, {
  through: AlunoHabilidade,
  foreignKey: "aluno_id",
  otherKey: "habilidade_id",
  as: "habilidades",
});
Habilidade.belongsToMany(Aluno, {
  through: AlunoHabilidade,
  foreignKey: "habilidade_id",
  otherKey: "aluno_id",
  as: "alunos",
});

module.exports = {
  sequelize,
  Sequelize,
  Aluno,
  Receita,
  Categoria,
  Habilidade,
  AlunoHabilidade,
};
