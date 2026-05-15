import mongoose from "mongoose";

/**
 * Schema de uma entrada de palavras do jogo.
 *
 * Cada documento contém uma palavraMestra e a lista de subPalavras
 * que podem ser encontradas a partir dela.
 * O campo `idioma` permite filtrar por português ou inglês.
 */
const palavraSchema = new mongoose.Schema({
    palavraMestra: { type: String, required: true },
    subPalavras: { type: [String], required: true },
    idioma: {
        type: String,
        enum: ["pt", "en"],
        default: "pt",
    },
});

export default mongoose.model("Palavra", palavraSchema);
