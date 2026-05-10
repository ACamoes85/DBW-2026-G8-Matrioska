import mongoose from "mongoose";

const partidaSchema = new mongoose.Schema({
  codigoSala: {
    type: String,
    required: true,
    unique: true,
  },
  jogadores: [
    {
      id: String,
      username: String,
      avatar: String,
      pontuacao: { type: Number, default: 0 },
      palavrasEncontradas: {
        type: [String],
        default: [],
      },
    },
  ],
  // Guarda se a sala é 'solo' ou 'multiplayer'
  modoJogo: {
    type: String,
    enum: ["solo", "multiplayer"],
    default: "multiplayer",
  },

  // Guarda o estado atual da partida
  estado: {
    type: String,
    enum: ["lobby", "em_jogo", "finalizada"],
    default: "lobby",
  },
  
  // Palavra escolhida para esta partida
  palavraMestra: {
    type: String,
    default: "",
  },

  // Lista de respostas válidas para a palavra-mestra (do banco de dados)
  subPalavras: {
    type: [String],
    default: [],
  },

  palavrasAcertadasRegisto: [
    {
      termo: String,     // A palavra acertada
      username: String,  // Quem a encontrou
      pontos: Number     // Quantos pontos valeu
    }
  ],

  // Tempo definido para esta partida
  tempoJogo: {
    type: Number,
    default: 30,
  },

  // Data/hora em que a partida começou
  iniciadaEm: {
    type: Date,
  },

  ativa: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, expires: 7200 }, // A sala expira em 2 horas
});

export default mongoose.model("Partida", partidaSchema);