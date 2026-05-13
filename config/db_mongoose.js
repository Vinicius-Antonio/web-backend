require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://SEU_USUARIO:SUA_SENHA@cluster0.xxxxx.mongodb.net/receitas_portfolio?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas conectado com sucesso."))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err));

module.exports = mongoose;
