"use strict";

import Palavra from "../models/Palavra.js";
import Partida from "../models/Partida.js";
import User from "../models/User.js";

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

export const guardarEstatisticasPartida = async (req, res) => {
    try {
        const {
            codigoSala,
            palavraMestre,
            palavrasEncontradas,
            pontuacao,
            tempoJogo
        } = req.body;

        if (!req.session.user) {
            return res.status(401).json({ erro: "Utilizador não autenticado." });
        }

        const novaPartida = await Partida.create({
            jogador: req.session.user.id,
            username: req.session.user.username,
            codigoSala: codigoSala || "SOLO",
            palavraMestre,
            palavrasEncontradas,
            totalPalavrasEncontradas: palavrasEncontradas.length,
            pontuacao,
            tempoJogo
        });

        await User.findByIdAndUpdate(req.session.user.id, {
            $inc: {
                "stats.gamesPlayed": 1,
                "stats.totalScore": pontuacao,
                "stats.wordsFound": palavrasEncontradas.length
            }
        });

        res.status(201).json({
            mensagem: "Estatísticas guardadas com sucesso.",
            partida: novaPartida
        });

    } catch (err) {
        console.error("Erro ao guardar estatísticas:", err);
        res.status(500).json({ erro: "Erro ao guardar estatísticas da partida." });
    }
};