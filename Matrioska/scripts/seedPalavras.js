"use strict";

import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import Palavra from "../models/Palavra.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const palavras = [
  // =====================
  // PORTUGUÊS DE PORTUGAL
  // =====================
  {
    palavraMestra: "PROGRAMAR",
    idioma: "pt",
    subPalavras: [
      "programa",
      "rogar",
      "parar",
      "pagar",
      "morar",
      "amar",
      "ramo",
      "mago",
      "mapa",
      "mar",
      "ora",
      "para",
    ],
  },
  {
    palavraMestra: "ESTUDANTE",
    idioma: "pt",
    subPalavras: [
      "dente",
      "tenda",
      "sente",
      "sede",
      "seda",
      "ante",
      "tende",
      "neta",
      "sete",
      "sena",
      "tua",
      "senta",
    ],
  },
  {
    palavraMestra: "PORTUGAL",
    idioma: "pt",
    subPalavras: [
      "porta",
      "prato",
      "trago",
      "lugar",
      "largo",
      "galo",
      "gato",
      "gota",
      "tropa",
      "roupa",
      "alto",
      "ruga",
      "autor",
    ],
  },
  {
    palavraMestra: "COMPUTADOR",
    idioma: "pt",
    subPalavras: [
      "motor",
      "porta",
      "campo",
      "corta",
      "troca",
      "couro",
      "muro",
      "pato",
      "toca",
      "rato",
      "moda",
      "amor",
      "duro",
      "copo",
    ],
  },
  {
    palavraMestra: "TECLADO",
    idioma: "pt",
    subPalavras: [
      "tecla",
      "lado",
      "tela",
      "cela",
      "cedo",
      "dote",
      "cola",
      "alto",
      "lote",
      "talo",
      "caldo",
      "delta",
      "ato",
    ],
  },
  {
    palavraMestra: "CADERNO",
    idioma: "pt",
    subPalavras: [
      "corda",
      "caro",
      "cano",
      "cone",
      "nora",
      "onde",
      "roda",
      "onda",
      "cena",
      "cedro",
      "dona",
      "cera",
    ],
  },
  {
    palavraMestra: "MERCADO",
    idioma: "pt",
    subPalavras: [
      "medo",
      "amor",
      "roda",
      "doma",
      "mora",
      "corda",
      "credo",
      "cera",
      "cedo",
      "remo",
      "mar",
      "arco",
      "cor",
    ],
  },
  {
    palavraMestra: "PLANETA",
    idioma: "pt",
    subPalavras: [
      "planta",
      "natal",
      "lata",
      "pena",
      "pata",
      "tela",
      "lenta",
      "anel",
      "nela",
      "alta",
      "anta",
      "tal",
    ],
  },
  {
    palavraMestra: "BIBLIOTECA",
    idioma: "pt",
    subPalavras: [
      "boleia",
      "botica",
      "coleta",
      "bela",
      "bola",
      "boca",
      "cabo",
      "cota",
      "lote",
      "tela",
      "toca",
      "bico",
      "cola",
    ],
  },
  {
    palavraMestra: "FLORESTA",
    idioma: "pt",
    subPalavras: [
      "flor",
      "forte",
      "festa",
      "resta",
      "seta",
      "tela",
      "fora",
      "roleta",
      "solar",
      "arte",
      "farol",
      "frota",
    ],
  },
  {
    palavraMestra: "ANIMAL",
    idioma: "pt",
    subPalavras: [
      "mina",
      "alma",
      "lama",
      "mal",
      "mania",
      "lima",
      "mil",
      "anil",
      "mala",
    ],
  },
  {
    palavraMestra: "DESPORTO",
    idioma: "pt",
    subPalavras: [
      "porto",
      "posto",
      "resto",
      "sorte",
      "poder",
      "perto",
      "rosto",
      "poste",
      "dote",
      "sopro",
      "porte",
      "preto",
      "tordo",
    ],
  },
  {
    palavraMestra: "MENTORIA",
    idioma: "pt",
    subPalavras: [
      "mento",
      "tenor",
      "menor",
      "termo",
      "tremo",
      "norte",
      "ritmo",
      "amor",
      "mora",
      "remo",
      "rima",
      "tema",
      "monte",
    ],
  },

  // =====================
  // INGLÊS
  // =====================
  {
    palavraMestra: "PROGRAMMING",
    idioma: "en",
    subPalavras: [
      "program",
      "gaming",
      "margin",
      "organ",
      "grain",
      "ring",
      "rain",
      "roam",
      "main",
      "minor",
      "going",
    ],
  },
  {
    palavraMestra: "COMPUTER",
    idioma: "en",
    subPalavras: [
      "compute",
      "court",
      "route",
      "troupe",
      "come",
      "core",
      "cure",
      "term",
      "more",
      "poem",
      "cope",
    ],
  },
  {
    palavraMestra: "LANGUAGE",
    idioma: "en",
    subPalavras: [
      "angel",
      "angle",
      "gale",
      "lane",
      "lean",
      "glue",
      "lunge",
      "gauge",
      "lag",
      "age",
      "gun",
      "leg",
      "lung",
    ],
  },
  {
    palavraMestra: "SCIENCE",
    idioma: "en",
    subPalavras: ["scene", "since", "nice", "sine", "seen", "ice"],
  },
  {
    palavraMestra: "ELEPHANT",
    idioma: "en",
    subPalavras: [
      "plant",
      "plane",
      "panel",
      "plate",
      "leap",
      "heat",
      "heal",
      "than",
      "path",
      "late",
      "neat",
      "heel",
      "help",
    ],
  },
  {
    palavraMestra: "MOUNTAIN",
    idioma: "en",
    subPalavras: [
      "mount",
      "amount",
      "union",
      "nation",
      "mint",
      "main",
      "unit",
      "unto",
      "tuna",
      "auto",
      "noun",
    ],
  },
  {
    palavraMestra: "CREATIVE",
    idioma: "en",
    subPalavras: [
      "create",
      "react",
      "trace",
      "crate",
      "cater",
      "active",
      "tear",
      "rate",
      "care",
      "ever",
      "vice",
      "rice",
    ],
  },
  {
    palavraMestra: "KEYBOARD",
    idioma: "en",
    subPalavras: [
      "board",
      "bored",
      "brake",
      "bread",
      "break",
      "ready",
      "road",
      "bark",
      "dark",
      "year",
      "bear",
      "dare",
      "bake",
    ],
  },
  {
    palavraMestra: "NOTEBOOK",
    idioma: "en",
    subPalavras: [
      "book",
      "note",
      "tone",
      "took",
      "boot",
      "bone",
      "token",
      "knot",
      "bent",
      "net",
      "too",
      "toe",
    ],
  },
  {
    palavraMestra: "GARDENER",
    idioma: "en",
    subPalavras: [
      "garden",
      "danger",
      "range",
      "green",
      "anger",
      "dear",
      "read",
      "near",
      "gear",
      "reed",
      "earn",
    ],
  },
  {
    palavraMestra: "TREASURE",
    idioma: "en",
    subPalavras: [
      "easter",
      "tears",
      "stare",
      "rates",
      "reuse",
      "erase",
      "sure",
      "seat",
      "tree",
      "rest",
      "star",
      "user",
    ],
  },
  {
    palavraMestra: "HOSPITAL",
    idioma: "en",
    subPalavras: [
      "pilot",
      "host",
      "post",
      "path",
      "tail",
      "soil",
      "shop",
      "salt",
      "spot",
      "list",
      "alto",
      "hail",
    ],
  },
];

async function seedPalavras() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI não encontrada no ficheiro .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Ligado ao MongoDB.");

    await Palavra.deleteMany({});
    console.log("Coleção palavras limpa.");

    await Palavra.insertMany(palavras);
    console.log(`${palavras.length} palavras inseridas com sucesso.`);

    await mongoose.connection.close();
    console.log("Ligação ao MongoDB fechada.");
  } catch (err) {
    console.error("Erro ao inserir palavras:", err);
    await mongoose.connection.close();
  }
}

seedPalavras();
