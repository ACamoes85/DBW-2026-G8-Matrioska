"use strict";

import Partida from "../models/Partida.js";
import Palavra from "../models/Palavra.js";

/**
 * Cria uma nova sala ou adiciona o jogador a uma sala existente
 */
export const criarOuEntrarSala = async (req, res) => {
  try {
    const { codigoSala, modoJogo, tempoJogo } = req.body;
    const user = req.session.user;

    if (!user) return res.redirect("/login");
    if (!codigoSala) return res.redirect("/hub?error=invalid");

    const codigoUpper = codigoSala.trim().toUpperCase();
    let sala = await Partida.findOne({ codigoSala: codigoUpper });

    const veioDeCriar = req.headers.referer && req.headers.referer.includes("create-match");

    if (sala) {
      if (sala.estado !== "lobby") {
        return res.redirect("/hub?error=started");
      }
      if (sala.modoJogo === "solo") {
        const jaEstaNaSala = sala.jogadores.find((j) => j.id === user.id);
        if (!jaEstaNaSala) {
          return res.redirect("/hub?error=solo_room");
        }
      }

      if (sala.modoJogo === "multiplayer" && sala.jogadores.length >= 4) {
        return res.redirect("/hub?error=full");
      }

      const jaEstaNaSala = sala.jogadores.find((j) => j.id === user.id);
      if (!jaEstaNaSala) {
        sala.jogadores.push({
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        });
        await sala.save();
      }
    } else {
      if (veioDeCriar) {
        sala = new Partida({
          codigoSala: codigoUpper,
          modoJogo: modoJogo || "multiplayer",
          estado: "lobby",
          tempoJogo: parseInt(tempoJogo, 10) || 30,
          jogadores: [
            {
              id: user.id,
              username: user.username,
              avatar: user.avatar,
            },
          ],
        });
        await sala.save();
      } else {
        return res.redirect("/hub?error=notfound");
      }
    }

    res.redirect(`/lobby?code=${sala.codigoSala}`);
  } catch (err) {
    console.error("Erro ao entrar na sala:", err);
    res.redirect("/hub");
  }
};

/**
 * Renderiza a página do Lobby
 */
export const renderizarLobby = async (req, res) => {
  try {
    const codigo = req.query.code;
    if (!codigo) return res.redirect("/hub");

    const sala = await Partida.findOne({ codigoSala: codigo.toUpperCase() });
    if (!sala) return res.redirect("/hub");

    res.render("lobby", {
      sala: sala,
      user: req.session.user,
    });
  } catch (err) {
    res.redirect("/hub");
  }
};

/**
 * Lógica para iniciar a partida (apenas o líder/primeiro da lista)
 */
export const iniciarPartida = async (req, res) => {
    try {
        const { codigoSala } = req.body;
        
        // Normalização do ID do utilizador na sessão
        const rawUserId = req.session.user?._id || req.session.user?.id;
        if (!rawUserId) return res.status(401).json({ erro: "Sessão expirada." });
        const idUtilizadorAtual = String(rawUserId).trim();

        // Forçamos a busca da sala sem cache para garantir que a lista de jogadores é a real
        const sala = await Partida.findOne({ codigoSala: codigoSala.toUpperCase() }).lean();
        
        if (!sala) return res.status(404).json({ erro: "Sala não encontrada." });

        if (!sala.jogadores || sala.jogadores.length === 0) {
            return res.status(400).json({ erro: "A sala está vazia." });
        }

        // Normalização do ID do Líder (sempre o índice 0)
        const primeiroJogador = sala.jogadores[0];
        const idLider = String(primeiroJogador.id || primeiroJogador._id).trim();

        console.log(`[DEBUG LÍDER]`);
        console.log(`ID do Líder na DB: "${idLider}"`);
        console.log(`Teu ID na Sessão:  "${idUtilizadorAtual}"`);

        if (idLider !== idUtilizadorAtual) {
            return res.status(403).json({ 
                erro: "Apenas o líder pode iniciar.",
                detalhe: "O líder atual é " + primeiroJogador.username 
            });
        }

        // --- Se passou a validação, segue o sorteio ---
        const contagem = await Palavra.countDocuments();
        if (contagem === 0) return res.status(500).json({ erro: "DB de palavras vazia." });

        const random = Math.floor(Math.random() * contagem);
        const sorteada = await Palavra.findOne().skip(random);

        await Partida.updateOne(
            { _id: sala._id },
            {
                $set: {
                    palavraMestra: sorteada.palavraMestra,
                    subPalavras: sorteada.subPalavras,
                    estado: "em_jogo",
                    iniciadaEm: new Date(),
                    palavrasAcertadasRegisto: []
                }
            }
        );

        const salaFinal = await Partida.findById(sala._id);
        salaFinal.jogadores.forEach(j => {
            j.pontuacao = 0;
            j.palavrasEncontradas = [];
        });
        await salaFinal.save();
        
        return res.status(200).json({ mensagem: "Partida iniciada!", codigoSala: sala.codigoSala });

    } catch (error) {
        console.error("Erro fatal no início:", error);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};

/**
 * Validação de palavras durante o modo Multiplayer
 */
export const validarPalavraMultiplayer = async (req, res, io) => {
    try {
        const { codigoSala, tentativa, userId } = req.body;

        if (!codigoSala || !tentativa || !userId) {
            return res.status(400).json({ erro: "Dados incompletos." });
        }

        const sala = await Partida.findOne({ codigoSala: codigoSala.toUpperCase() });

        if (!sala || sala.estado !== "em_jogo") {
            return res.status(404).json({ erro: "Partida não está ativa ou não existe." });
        }

        const termoSubmetido = tentativa.trim().toUpperCase();

        // Verificar se a palavra existe nas subpalavras válidas
        const palavraExiste = sala.subPalavras.some(p => p.trim().toUpperCase() === termoSubmetido);

        if (!palavraExiste) {
            return res.status(400).json({ status: "errada", mensagem: "Essa palavra não existe!" });
        }

        // Verificar se já foi acertada por alguém nesta partida
        const jaEncontrada = sala.palavrasAcertadasRegisto.find(p => p.termo.toUpperCase() === termoSubmetido);
        if (jaEncontrada) {
            return res.status(400).json({ 
                status: "repetida", 
                mensagem: `Já encontrada por ${jaEncontrada.username}!` 
            });
        }

        // Identificar o jogador que enviou
        const jogador = sala.jogadores.find(j => String(j.id || j._id) === String(userId));
        if (!jogador) return res.status(403).json({ erro: "Jogador não pertence a esta sala." });

        const pontosGanhos = termoSubmetido.length * 10;
        
        // Atualizar estatísticas do jogador na sala
        jogador.pontuacao = (jogador.pontuacao || 0) + pontosGanhos;
        jogador.palavrasEncontradas.push(termoSubmetido);

        const novoRegisto = { 
            termo: termoSubmetido, 
            username: jogador.username, 
            pontos: pontosGanhos 
        };
        sala.palavrasAcertadasRegisto.push(novoRegisto);

        sala.markModified('jogadores');
        sala.markModified('palavrasAcertadasRegisto');

        await sala.save();

        // Notificar todos na sala sobre o acerto via Socket.io
        if (io) {
            io.to(sala.codigoSala.toUpperCase()).emit("palavra-descoberta-global", {
                registo: novoRegisto,
                pontuacaoAtualizada: jogador.pontuacao,
                userId: userId
            });
        }

        return res.status(200).json({ status: "sucesso", pontos: pontosGanhos });

    } catch (error) {
        console.error("Erro na validação de palavra:", error);
        return res.status(500).json({ erro: "Erro no servidor ao validar palavra." });
    }
};

/**
 * Renderiza a tela de jogo principal
 */
export const renderizarJogo = async (req, res) => {
  try {
    const codigoSala = req.query.code;
    if (!codigoSala) return res.redirect("/hub");

    const sala = await Partida.findOne({ codigoSala: codigoSala.trim().toUpperCase() });
    if (!sala) return res.redirect("/hub?error=notfound");
    if (sala.estado === "lobby") return res.redirect(`/lobby?code=${sala.codigoSala}`);

    const jogo = {
      palavraMestra: sala.palavraMestra, 
      subPalavras: sala.subPalavras,
    };

    res.render("gamescreen", { jogo, sala, user: req.session.user });
  } catch (err) {
    console.error("Erro ao renderizar gamescreen:", err);
    res.status(500).send("Erro ao carregar ecrã de jogo.");
  }
};

/**
 * Guarda as estatísticas finais de um jogador após o término
 */
export const guardarEstatisticasPartida = async (req, res) => {
  try {
    const { codigoSala, pontuacao, palavrasEncontradas } = req.body;
    const userId = req.session.user?.id || req.session.user?._id;

    if (!codigoSala || !userId) return res.status(400).json({ erro: "Dados insuficientes." });

    await Partida.findOneAndUpdate(
      { codigoSala: codigoSala.trim().toUpperCase(), "jogadores.id": userId },
      {
        $set: {
          "jogadores.$.pontuacao": pontuacao,
          "jogadores.$.palavrasEncontradas": palavrasEncontradas,
        },
      },
    );
    res.status(201).json({ mensagem: "Estatísticas guardadas com sucesso." });
  } catch (err) {
    console.error("Erro ao guardar estatísticas:", err);
    res.status(500).json({ erro: "Erro interno ao guardar dados." });
  }
};