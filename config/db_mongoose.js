require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas conectado com sucesso."))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err));

module.exports = mongoose;
