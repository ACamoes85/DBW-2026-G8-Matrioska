"use strict";

import Palavra from "../models/Palavra.js";

export const renderizarJogo = async (req, res) => {
    try {
        // Procuramos todas as palavras na coleção "palavras" do MongoDB
        const todasAsPalavras = await Palavra.find();

        if (todasAsPalavras.length === 0) {
            return res.status(404).send("Erro: Nenhuma palavra encontrada no MongoDB Atlas.");
        }

        // Escolhemos uma palavra aleatória
        const jogoSorteado = todasAsPalavras[Math.floor(Math.random() * todasAsPalavras.length)];

        // Enviamos para o EJS
        res.render('gamescreen', { jogo: jogoSorteado });

    } catch (err) {
        console.error("Erro ao buscar palavra no Mongo:", err);
        res.status(500).send("Erro ao carregar os dados do jogo.");
    }
};