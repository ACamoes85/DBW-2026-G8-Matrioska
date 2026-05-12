"use strict";
import mongoose from "mongoose";

const palavraSchema = new mongoose.Schema({
  palavraMestra: {
    type: String,
    required: true,
  },
  idioma: {
    type: String,
    enum: ["pt", "en"],
    required: true,
    default: "pt",
  },
  subPalavras: {
    type: [String],
    required: true,
  },
});

palavraSchema.index({ palavraMestra: 1, idioma: 1 }, { unique: true });

// Forçamos o nome da coleção para "palavras" (o que criaste no Atlas)
const Palavra = mongoose.model("Palavra", palavraSchema, "palavras");
export default Palavra;
