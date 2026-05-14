import mongoose from "mongoose";

const lobbySchema = new mongoose.Schema({
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
      respostasErradas: {
        type: Number,
        default: 0,
      },
      estatisticasEntregues: {
        type: Boolean,
        default: false,
      },
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

  palavraMestra: {
    type: String,
    default: "",
  },

  subPalavras: {
    type: [String],
    default: [],
  },

  palavrasAcertadasRegisto: [
    {
      termo: String,
      username: String,
      pontos: Number,
    },
  ],

  tempoJogo: {
    type: Number,
    default: 30,
  },

  iniciadaEm: {
    type: Date,
  },

  estatisticasGuardadas: {
    type: Boolean,
    default: false,
  },

  finalizadaEm: {
    type: Date,
  },

  ativa: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, expires: 7200 },
});

export default mongoose.model("Lobby", lobbySchema);