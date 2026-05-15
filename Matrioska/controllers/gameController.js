"use strict";

import Palavra from "../models/Palavra.js";
import User from "../models/User.js";
import Lobby from "../models/Lobby.js";
import { sanitizarCodigo, sanitizarPalavra } from "../utils/sanitize.js";
import { verificarRateLimit } from "../utils/rateLimiter.js";

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * Cria uma nova sala ou adiciona o jogador a uma sala existente.
 * O comportamento depende de onde o utilizador veio (create-match ou hub).
 */
export const criarOuEntrarSala = async (req, res) => {
    try {
        const { codigoSala, modoJogo, tempoJogo, idiomaJogo } = req.body;
        const user = req.session.user;
        if (!user) return res.redirect("/login");

        const idiomaNormalizado = idiomaJogo === "en" ? "en" : "pt";
        const codigoUpper = sanitizarCodigo(codigoSala);
        if (!codigoUpper) return res.redirect("/hub?error=invalid");

        let sala = await Lobby.findOne({ codigoSala: codigoUpper });

        const veioDeCriar =
            req.headers.referer && req.headers.referer.includes("create-match");

        if (sala) {
            // Sala já existe — tentar entrar
            if (sala.estado !== "lobby") return res.redirect("/hub?error=started");
            if (sala.modoJogo === "solo") {
                const jaEsta = sala.jogadores.find((j) => String(j.id) === String(user.id));
                if (!jaEsta) return res.redirect("/hub?error=solo_room");
            }
            if (sala.modoJogo === "multiplayer" && sala.jogadores.length >= 4) {
                return res.redirect("/hub?error=full");
            }
            const jaEsta = sala.jogadores.find((j) => String(j.id) === String(user.id));
            if (!jaEsta) {
                sala.jogadores.push({ id: user.id, username: user.username, avatar: user.avatar });
                await sala.save();
            }
        } else {
            // Sala não existe — só cria se veio da página create-match
            if (!veioDeCriar) return res.redirect("/hub?error=notfound");

            sala = new Lobby({
                codigoSala: codigoUpper,
                modoJogo: modoJogo || "multiplayer",
                idiomaJogo: idiomaNormalizado,
                estado: "lobby",
                tempoJogo: parseInt(tempoJogo, 10) || 30,
                jogadores: [{ id: user.id, username: user.username, avatar: user.avatar }],
            });
            await sala.save();
        }

        res.redirect(`/lobby?code=${sala.codigoSala}`);
    } catch (err) {
        console.error("Erro ao entrar na sala:", err);
        res.redirect("/hub");
    }
};

/**
 * Renderiza a página do Lobby com os dados da sala.
 */
export const renderizarLobby = async (req, res) => {
    try {
        const codigo = req.query.code;
        if (!codigo) return res.redirect("/hub");

        const sala = await Lobby.findOne({ codigoSala: codigo.toUpperCase() });
        if (!sala) return res.redirect("/hub");

        res.render("lobby", { sala, user: req.session.user });
    } catch (err) {
        res.redirect("/hub");
    }
};

/**
 * Inicia a partida. Apenas o líder (primeiro jogador da lista) pode fazê-lo.
 * Selecciona uma palavra aleatória da BD e actualiza o estado da sala.
 */
export const iniciarPartida = async (req, res) => {
    try {
        const { codigoSala } = req.body;
        const rawUserId = req.session.user?._id || req.session.user?.id;
        if (!rawUserId) return res.status(401).json({ erro: "Sessão expirada." });

        const codigoUpper = sanitizarCodigo(codigoSala);
        if (!codigoUpper) return res.status(400).json({ erro: "Código inválido." });

        const idUtilizadorAtual = String(rawUserId).trim();
        const sala = await Lobby.findOne({ codigoSala: codigoUpper }).lean();

        if (!sala) return res.status(404).json({ erro: "Sala não encontrada." });
        if (!sala.jogadores || sala.jogadores.length === 0)
            return res.status(400).json({ erro: "A sala está vazia." });

        // Verifica se quem pede é realmente o líder
        const idLider = String(sala.jogadores[0].id || sala.jogadores[0]._id).trim();
        if (idLider !== idUtilizadorAtual) {
            return res.status(403).json({ erro: "Apenas o líder pode iniciar." });
        }

        // Selecciona uma palavra aleatória do idioma configurado para a sala
        const idioma = sala.idiomaJogo || "pt";
        const contagem = await Palavra.countDocuments({ idioma });
        if (contagem === 0) {
            return res.status(500).json({ erro: `Sem palavras para o idioma ${idioma}.` });
        }

        const sorteada = await Palavra.findOne({ idioma }).skip(
            Math.floor(Math.random() * contagem)
        );

        // Actualiza a sala com a palavra e muda o estado para "em_jogo"
        await Lobby.updateOne(
            { _id: sala._id },
            {
                $set: {
                    palavraMestra: sorteada.palavraMestra,
                    subPalavras: sorteada.subPalavras,
                    estado: "em_jogo",
                    iniciadaEm: new Date(),
                    finalizadaEm: null,
                    estatisticasGuardadas: false,
                    palavrasAcertadasRegisto: [],
                },
            }
        );

        // Reinicia a pontuação de todos os jogadores
        const salaFinal = await Lobby.findById(sala._id);
        salaFinal.jogadores.forEach((j) => {
            j.pontuacao = 0;
            j.palavrasEncontradas = [];
            j.respostasErradas = 0;
            j.estatisticasEntregues = false;
        });
        await salaFinal.save();

        return res.status(200).json({ mensagem: "Partida iniciada!", codigoSala: sala.codigoSala });
    } catch (error) {
        console.error("Erro ao iniciar partida:", error);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};

/**
 * Valida uma tentativa de palavra no modo Multiplayer.
 * Aplica rate limiting e sanitização antes de processar.
 * Emite evento Socket.IO para notificar todos os jogadores da sala.
 */
export const validarPalavraMultiplayer = async (req, res, io) => {
    try {
        const { codigoSala, tentativa, userId } = req.body;

        if (!codigoSala || !tentativa || !userId) {
            return res.status(400).json({ erro: "Dados incompletos." });
        }

        // Rate limiting: máx. 10 tentativas por 5 segundos por jogador/sala
        if (verificarRateLimit(`${userId}:${codigoSala}`)) {
            return res.status(429).json({ erro: "Demasiadas tentativas. Abranda um pouco!" });
        }

        const codigoUpper = sanitizarCodigo(codigoSala);
        const termoSubmetido = sanitizarPalavra(tentativa);
        if (!codigoUpper || !termoSubmetido) {
            return res.status(400).json({ erro: "Dados inválidos." });
        }

        const sala = await Lobby.findOne({ codigoSala: codigoUpper });
        if (!sala || sala.estado !== "em_jogo") {
            return res.status(404).json({ erro: "Partida não está activa ou não existe." });
        }

        // Verifica se a palavra existe nas subpalavras da palavra-mestra
        const palavraExiste = sala.subPalavras.some(
            (p) => p.trim().toUpperCase() === termoSubmetido
        );
        if (!palavraExiste) {
            return res.status(400).json({ status: "errada", mensagem: "Essa palavra não existe!" });
        }

        // Verifica se a palavra já foi encontrada por outro jogador
        const jaEncontrada = sala.palavrasAcertadasRegisto.find(
            (p) => p.termo.toUpperCase() === termoSubmetido
        );
        if (jaEncontrada) {
            return res.status(400).json({
                status: "repetida",
                mensagem: `Já encontrada por ${jaEncontrada.username}!`,
            });
        }

        const jogador = sala.jogadores.find(
            (j) => String(j.id || j._id) === String(userId)
        );
        if (!jogador) return res.status(403).json({ erro: "Jogador não pertence a esta sala." });

        // Pontuação: comprimento da palavra × 10 pontos
        const pontosGanhos = termoSubmetido.length * 10;
        jogador.pontuacao = (jogador.pontuacao || 0) + pontosGanhos;
        jogador.palavrasEncontradas.push(termoSubmetido);

        const novoRegisto = { termo: termoSubmetido, username: jogador.username, pontos: pontosGanhos };
        sala.palavrasAcertadasRegisto.push(novoRegisto);
        sala.markModified("jogadores");
        sala.markModified("palavrasAcertadasRegisto");
        await sala.save();

        // Notifica todos os jogadores da sala sobre a nova palavra encontrada
        if (io) {
            io.to(sala.codigoSala.toUpperCase()).emit("palavra-descoberta-global", {
                registo: novoRegisto,
                pontuacaoAtualizada: jogador.pontuacao,
                userId,
            });
        }

        return res.status(200).json({ status: "sucesso", pontos: pontosGanhos });
    } catch (error) {
        console.error("Erro na validação de palavra:", error);
        return res.status(500).json({ erro: "Erro no servidor ao validar palavra." });
    }
};

/**
 * Renderiza o ecrã de jogo.
 * Calcula o tempo restante no servidor para sincronizar todos os clientes.
 */
export const renderizarJogo = async (req, res) => {
    try {
        const codigoSala = req.query.code;
        if (!codigoSala) return res.redirect("/hub");

        const sala = await Lobby.findOne({ codigoSala: codigoSala.trim().toUpperCase() });
        if (!sala) return res.redirect("/hub?error=notfound");
        if (sala.estado === "lobby") return res.redirect(`/lobby?code=${sala.codigoSala}`);

        // Sincronizar o timer com base no tempo de início guardado no servidor
        let tempoRestanteServidor = sala.tempoJogo || 30;
        if (sala.iniciadaEm) {
            const decorrido = Math.floor((Date.now() - new Date(sala.iniciadaEm).getTime()) / 1000);
            tempoRestanteServidor = Math.max(0, sala.tempoJogo - decorrido);
        }

        const jogo = {
            palavraMestra: sala.palavraMestra,
            subPalavras: sala.subPalavras,
            tempoRestante: tempoRestanteServidor,
            iniciadaEm: sala.iniciadaEm,
            tempoJogo: sala.tempoJogo,
        };

        res.render("gamescreen", { jogo, sala, user: req.session.user });
    } catch (err) {
        console.error("Erro ao renderizar gamescreen:", err);
        res.status(500).send("Erro ao carregar ecrã de jogo.");
    }
};

/**
 * Guarda as estatísticas de um jogador no fim da partida.
 * Usa operação atómica para evitar duplicados em pedidos concorrentes.
 * Quando todos os jogadores entregam, actualiza as stats globais no User.
 */
export const guardarEstatisticasPartida = async (req, res) => {
    try {
        const {
            codigoSala,
            pontuacao = 0,
            palavrasEncontradas = [],
            respostasErradas = 0,
        } = req.body;

        const userId = String(req.session.user?.id || req.session.user?._id || "");

        // Evita pedidos duplicados do mesmo jogador
        if (verificarRateLimit(`guardar:${userId}`)) {
            return res.status(429).json({ erro: "Pedido duplicado." });
        }

        const codigoUpper = sanitizarCodigo(codigoSala);
        if (!codigoUpper || !userId) {
            return res.status(400).json({ erro: "Dados insuficientes." });
        }

        // Operação atómica: só marca como entregue se ainda não o foi (evita race condition)
        const salaAntes = await Lobby.findOneAndUpdate(
            {
                codigoSala: codigoUpper,
                "jogadores.id": userId,
                "jogadores.estatisticasEntregues": false,
            },
            {
                $set: {
                    "jogadores.$.estatisticasEntregues": true,
                    "jogadores.$.respostasErradas": Number(respostasErradas) || 0,
                },
            },
            { new: false }
        );

        if (!salaAntes) {
            // Já entregou anteriormente — responde OK para o cliente navegar normalmente
            const salaExiste = await Lobby.exists({ codigoSala: codigoUpper });
            if (!salaExiste) return res.status(404).json({ erro: "Partida não encontrada." });
            return res.status(201).json({ mensagem: "Estatísticas já guardadas." });
        }

        // No modo solo, os dados vêm do cliente (não há tracking em tempo real)
        const jogador = salaAntes.jogadores.find((j) => String(j.id || j._id) === userId);
        if (jogador && salaAntes.modoJogo === "solo") {
            await Lobby.updateOne(
                { codigoSala: codigoUpper, "jogadores.id": userId },
                {
                    $set: {
                        "jogadores.$.pontuacao": Number(pontuacao) || 0,
                        "jogadores.$.palavrasEncontradas": Array.isArray(palavrasEncontradas)
                            ? palavrasEncontradas
                            : [],
                    },
                }
            );
        }

        // Verifica se todos os jogadores já entregaram as estatísticas
        const salaAtual = await Lobby.findOne({ codigoSala: codigoUpper });
        if (!salaAtual) return res.status(201).json({ mensagem: "Estatísticas guardadas." });

        const todosEntregaram = salaAtual.jogadores.every((j) => j.estatisticasEntregues === true);

        if (todosEntregaram && !salaAtual.estatisticasGuardadas) {
            // Marca como finalizada de forma atómica para evitar dupla execução
            const resultado = await Lobby.findOneAndUpdate(
                { _id: salaAtual._id, estatisticasGuardadas: false },
                { $set: { estatisticasGuardadas: true, estado: "finalizada", finalizadaEm: new Date() } },
                { new: true }
            );

            if (resultado) {
                // Actualiza as stats globais de cada jogador no documento User
                for (const j of resultado.jogadores) {
                    await User.findOneAndUpdate(
                        { username: j.username },
                        {
                            $inc: {
                                "stats.totalScore": Number(j.pontuacao) || 0,
                                "stats.correctAnswers": j.palavrasEncontradas?.length || 0,
                                "stats.wrongAnswers": Number(j.respostasErradas) || 0,
                                "stats.gamesPlayed": 1,
                            },
                        }
                    );
                }
                console.log(`[Stats] Partida ${codigoUpper} finalizada com ${resultado.jogadores.length} jogadores.`);
            }
        } else if (!salaAtual.estatisticasGuardadas) {
            await Lobby.updateOne(
                { _id: salaAtual._id },
                { $set: { estado: "finalizada", finalizadaEm: new Date() } }
            );
        }

        res.status(201).json({ mensagem: "Estatísticas guardadas." });
    } catch (err) {
        console.error("Erro ao guardar estatísticas:", err);
        res.status(500).json({ erro: "Erro interno ao guardar dados." });
    }
};

/**
 * Devolve o ranking final da sala para o scoreboard.
 * Ordenado por pontuação decrescente.
 */
export const obterScoreboardPartida = async (req, res) => {
    try {
        const { codigoSala } = req.params;
        if (!codigoSala) return res.status(400).json({ erro: "Código da sala em falta." });

        const sala = await Lobby.findOne({ codigoSala: codigoSala.trim().toUpperCase() }).lean();
        if (!sala) return res.status(404).json({ erro: "Partida não encontrada." });

        const ranking = sala.jogadores
            .map((j) => ({
                username: j.username,
                avatar: j.avatar,
                pontuacao: j.pontuacao || 0,
                palavrasCertas: j.palavrasEncontradas?.length || 0,
                respostasErradas: j.respostasErradas || 0,
            }))
            .sort((a, b) => b.pontuacao - a.pontuacao);

        res.status(200).json({ codigoSala: sala.codigoSala, ranking, vencedor: ranking[0] || null });
    } catch (err) {
        console.error("Erro ao obter scoreboard:", err);
        res.status(500).json({ erro: "Erro ao obter scoreboard." });
    }
};

/**
 * Reinicia a sala para o estado de lobby, mantendo os mesmos jogadores.
 * Só o líder pode executar esta acção.
 */
export const reiniciarLobby = async (req, res, io) => {
    try {
        const { codigoSala } = req.body;
        const rawUserId = req.session.user?._id || req.session.user?.id;

        const codigoUpper = sanitizarCodigo(codigoSala);
        if (!codigoUpper || !rawUserId) return res.status(400).json({ erro: "Dados inválidos." });

        const sala = await Lobby.findOne({ codigoSala: codigoUpper });
        if (!sala) return res.status(404).json({ erro: "Sala não encontrada." });

        const idLider = String(sala.jogadores[0]?.id || sala.jogadores[0]?._id).trim();
        if (idLider !== String(rawUserId).trim()) {
            return res.status(403).json({ erro: "Apenas o líder pode reiniciar o lobby." });
        }

        // Repõe o estado da sala para lobby
        sala.estado = "lobby";
        sala.palavraMestra = "";
        sala.subPalavras = [];
        sala.palavrasAcertadasRegisto = [];
        sala.estatisticasGuardadas = false;
        sala.finalizadaEm = null;
        sala.iniciadaEm = null;

        sala.jogadores.forEach((j) => {
            j.pontuacao = 0;
            j.palavrasEncontradas = [];
            j.respostasErradas = 0;
            j.estatisticasEntregues = false;
        });

        await sala.save();

        if (io) {
            io.to(codigoUpper).emit("voltar-ao-lobby", codigoUpper);
            io.to(codigoUpper).emit("room-update", {
                jogadores: sala.jogadores,
                modoJogo: sala.modoJogo,
            });
        }

        return res.status(200).json({ mensagem: "Lobby reiniciado!" });
    } catch (err) {
        console.error("Erro ao reiniciar lobby:", err);
        return res.status(500).json({ erro: "Erro interno ao reiniciar lobby." });
    }
};

/**
 * Devolve o username do líder actual da sala.
 */
export const obterLiderSala = async (req, res) => {
    try {
        const { codigoSala } = req.params;
        const sala = await Lobby.findOne({ codigoSala: codigoSala.trim().toUpperCase() }).lean();
        if (!sala || sala.jogadores.length === 0) return res.status(404).json({ username: null });
        return res.status(200).json({ username: sala.jogadores[0].username });
    } catch (err) {
        return res.status(500).json({ username: null });
    }
};
