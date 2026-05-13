const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    texto: {
      type: String,
      required: true,
    },
    autor: {
      type: String,
      required: true,
    },
    receitaId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comentario", comentarioSchema);
