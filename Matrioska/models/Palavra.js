"use strict";
import mongoose from "mongoose";

const palavraSchema = new mongoose.Schema({
    palavraMestra: {
        type: String,
        required: true,
        unique: true 
    },
    subPalavras: {
        type: [String], 
        required: true
    }
});

// Forçamos o nome da coleção para "palavras" (o que criaste no Atlas)
const Palavra = mongoose.model("Palavra", palavraSchema, "palavras");
export default Palavra;