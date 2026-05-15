import mongoose from "mongoose";

/**
 * Schema da Sala de Jogo (Lobby).
 *
 * Representa uma partida, desde a fase de lobby até ao fim.
 * TTL de 2 horas (7200s) via createdAt para limpeza automática pelo MongoDB.
 */
const lobbySchema = new mongoose.Schema({
    codigoSala: {
        type: String,
        required: true,
        unique: true,
    },

    // Lista de jogadores presentes na sala
    jogadores: [
        {
            id: String,
            username: String,
            avatar: String,
            pontuacao: { type: Number, default: 0 },
            palavrasEncontradas: { type: [String], default: [] },
            respostasErradas: { type: Number, default: 0 },
            // Impede que as stats sejam guardadas mais do que uma vez por jogador
            estatisticasEntregues: { type: Boolean, default: false },
        },
    ],

    idiomaJogo: {
        type: String,
        enum: ["pt", "en"],
        default: "pt",
    },

    modoJogo: {
        type: String,
        enum: ["solo", "multiplayer"],
        default: "multiplayer",
    },

    estado: {
        type: String,
        enum: ["lobby", "em_jogo", "finalizada"],
        default: "lobby",
    },

    palavraMestra: { type: String, default: "" },
    subPalavras: { type: [String], default: [] },

    // Registo global de todas as palavras encontradas durante a partida
    palavrasAcertadasRegisto: [
        {
            termo: String,
            username: String,
            pontos: Number,
        },
    ],

    tempoJogo: { type: Number, default: 30 }, // duração em segundos
    iniciadaEm: { type: Date },               // usado para sincronizar o timer entre clientes
    finalizadaEm: { type: Date },

    // Evita duplicação ao guardar stats quando vários jogadores terminam ao mesmo tempo
    estatisticasGuardadas: { type: Boolean, default: false },

    ativa: { type: Boolean, default: true },

    // TTL: o MongoDB apaga automaticamente salas com mais de 2 horas
    createdAt: { type: Date, default: Date.now, expires: 7200 },
});

export default mongoose.model("Lobby", lobbySchema);
