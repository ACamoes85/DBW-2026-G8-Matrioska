import mongoose from "mongoose";

const partidaSchema = new mongoose.Schema({
    codigoSala: { 
        type: String, 
        required: true, 
        unique: true 
    },
    jogadores: [{
        id: String,
        username: String,
        avatar: String,
        pontuacao: { type: Number, default: 0 }
    }],
    // Guarda se a sala é 'solo' ou 'multiplayer'
    modoJogo: { 
        type: String, 
        enum: ['solo', 'multiplayer'], 
        default: 'multiplayer' 
    },
    palavrasEncontradas: [String],
    ativa: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // A sala expira em 1 hora
});

export default mongoose.model("Partida", partidaSchema);