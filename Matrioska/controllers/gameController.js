"use strict";

import Partida from "../models/Partida.js";
import Palavra from "../models/Palavra.js";

export const criarOuEntrarSala = async (req, res) => {
    try {
        // O modoJogo deve vir do formulário (solo ou multiplayer)
        const { codigoSala, modoJogo } = req.body;
        const user = req.session.user;

        if (!user) return res.redirect('/login');

        const codigoUpper = codigoSala.toUpperCase();
        let sala = await Partida.findOne({ codigoSala: codigoUpper });

        // Verifica se o pedido vem da página de criação
        const veioDeCriar = req.headers.referer && req.headers.referer.includes('create-match');

        if (sala) {
            // REGRA DO MODO SOLO: Se a sala já existe e o modo é SOLO
            // Apenas o dono (que já está lá dentro) pode reentrar. Outros são barrados.
            if (sala.modoJogo === 'solo') {
                const jaEstaNaSala = sala.jogadores.find(j => j.id === user.id);
                if (!jaEstaNaSala) {
                    return res.redirect('/hub?error=solo_room');
                }
            }

            // LIMITE DE 4 JOGADORES (Apenas para Multiplayer)
            if (sala.modoJogo === 'multiplayer' && sala.jogadores.length >= 4) {
                return res.redirect('/hub?error=full');
            }

            // Adicionar jogador se não estiver lá e for multiplayer
            const jaEstaNaSala = sala.jogadores.find(j => j.id === user.id);
            if (!jaEstaNaSala) {
                sala.jogadores.push({
                    id: user.id,
                    username: user.username,
                    avatar: user.avatar
                });
                await sala.save();
            }
        } else {
            // Se a sala não existe, criamos uma nova
            if (veioDeCriar) {
                sala = new Partida({
                    codigoSala: codigoUpper,
                    modoJogo: modoJogo || 'multiplayer', // Define se é solo ou multi
                    jogadores: [{
                        id: user.id,
                        username: user.username,
                        avatar: user.avatar
                    }]
                });
                await sala.save();
            } else {
                // Se tentou entrar num código que não existe pelo Hub
                return res.redirect('/hub?error=notfound');
            }
        }

        res.redirect(`/lobby?code=${sala.codigoSala}`);

    } catch (err) {
        console.error("Erro ao entrar na sala:", err);
        res.redirect('/hub');
    }
};

export const renderizarLobby = async (req, res) => {
    try {
        const codigo = req.query.code;
        const sala = await Partida.findOne({ codigoSala: codigo });

        if (!sala) return res.redirect('/hub');

        res.render("lobby", { 
            sala: sala, 
            user: req.session.user 
        });
    } catch (err) {
        res.redirect('/hub');
    }
};

export const renderizarJogo = async (req, res) => {
    try {
        const todasAsPalavras = await Palavra.find();
        const jogoSorteado = todasAsPalavras[Math.floor(Math.random() * todasAsPalavras.length)];
        res.render("gamescreen", { jogo: jogoSorteado });
    } catch (err) {
        res.status(500).send("Erro ao carregar jogo.");
    }
};

export const guardarEstatisticasPartida = async (req, res) => {
    try {
        const { codigoSala, pontuacao, palavrasEncontradas } = req.body;
        const userId = req.session.user.id;

        await Partida.findOneAndUpdate(
            { codigoSala: codigoSala, "jogadores.id": userId },
            { 
                $set: { "jogadores.$.pontuacao": pontuacao },
                $addToSet: { palavrasEncontradas: { $each: palavrasEncontradas } } 
            }
        );
        res.status(201).json({ mensagem: "OK" });
    } catch (err) {
        res.status(500).json({ erro: "Erro" });
    }
};