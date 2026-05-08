"use strict";

import mongoose from "mongoose";

const partidaSchema = new mongoose.Schema({
    jogador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    username: {
        type: String,
        required: true
    },

    codigoSala: {
        type: String,
        default: "SOLO"
    },

    palavraMestre: {
        type: String,
        required: true
    },

    palavrasEncontradas: {
        type: [String],
        default: []
    },

    totalPalavrasEncontradas: {
        type: Number,
        default: 0
    },

    pontuacao: {
        type: Number,
        default: 0
    },

    tempoJogo: {
        type: Number,
        default: 30
    },

    dataPartida: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Partida", partidaSchema);