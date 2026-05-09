"use strict";

import Partida from "../models/Partida.js";
import Palavra from "../models/Palavra.js";

export const criarOuEntrarSala = async (req, res) => {
  try {
    // O modoJogo deve vir do formulário (solo ou multiplayer)
    const { codigoSala, modoJogo, tempoJogo } = req.body;
    const user = req.session.user;

    if (!user) return res.redirect("/login");
    if (!codigoSala) return res.redirect("/hub?error=invalid");

    const codigoUpper = codigoSala.trim().toUpperCase();
    let sala = await Partida.findOne({ codigoSala: codigoUpper });

    // Verifica se o pedido vem da página de criação
    const veioDeCriar =
      req.headers.referer && req.headers.referer.includes("create-match");

    if (sala) {
      if (sala.estado !== "lobby") {
        return res.redirect("/hub?error=started");
      }
      // REGRA DO MODO SOLO: Se a sala já existe e o modo é SOLO
      // Apenas o dono (que já está lá dentro) pode reentrar. Outros são barrados.
      if (sala.modoJogo === "solo") {
        const jaEstaNaSala = sala.jogadores.find((j) => j.id === user.id);
        if (!jaEstaNaSala) {
          return res.redirect("/hub?error=solo_room");
        }
      }

      // LIMITE DE 4 JOGADORES (Apenas para Multiplayer)
      if (sala.modoJogo === "multiplayer" && sala.jogadores.length >= 4) {
        return res.redirect("/hub?error=full");
      }

      // Adicionar jogador se não estiver lá e for multiplayer
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
      // Se a sala não existe, criamos uma nova
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
        // Se tentou entrar num código que não existe pelo Hub
        return res.redirect("/hub?error=notfound");
      }
    }

    res.redirect(`/lobby?code=${sala.codigoSala}`);
  } catch (err) {
    console.error("Erro ao entrar na sala:", err);
    res.redirect("/hub");
  }
};

export const renderizarLobby = async (req, res) => {
  try {
    const codigo = req.query.code;

    if (!codigo) {
      return res.redirect("/hub");
    }

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

export const iniciarPartida = async (req, res) => {
  try {
    const { codigoSala } = req.body;
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ erro: "Utilizador não autenticado." });
    }

    if (!codigoSala) {
      return res.status(400).json({ erro: "Código da sala em falta." });
    }

    const sala = await Partida.findOne({
      codigoSala: codigoSala.trim().toUpperCase(),
    });

    if (!sala) {
      return res.status(404).json({ erro: "Sala não encontrada." });
    }

    const lider = sala.jogadores[0];

    if (!lider || lider.id !== user.id) {
      return res
        .status(403)
        .json({ erro: "Apenas o líder pode iniciar a partida." });
    }

    if (sala.estado !== "lobby") {
      return res.status(400).json({ erro: "Esta partida já começou." });
    }

    const todasAsPalavras = await Palavra.find();

    if (todasAsPalavras.length === 0) {
      return res.status(404).json({ erro: "Nenhuma palavra encontrada." });
    }

    const jogoSorteado =
      todasAsPalavras[Math.floor(Math.random() * todasAsPalavras.length)];

    sala.estado = "em_jogo";
    sala.palavraMestre = jogoSorteado.palavraMestra;
    sala.subPalavras = jogoSorteado.subPalavras;
    sala.iniciadaEm = new Date();

    await sala.save();

    res.status(200).json({
      mensagem: "Partida iniciada com sucesso.",
      codigoSala: sala.codigoSala,
    });
  } catch (err) {
    console.error("Erro ao iniciar partida:", err);
    res.status(500).json({ erro: "Erro ao iniciar partida." });
  }
};

export const renderizarJogo = async (req, res) => {
  try {
    const codigoSala = req.query.code;

    if (!codigoSala) {
      return res.redirect("/hub");
    }

    const sala = await Partida.findOne({
      codigoSala: codigoSala.trim().toUpperCase(),
    });

    if (!sala) {
      return res.redirect("/hub?error=notfound");
    }

    if (sala.estado === "lobby") {
      return res.redirect(`/lobby?code=${sala.codigoSala}`);
    }

    const jogo = {
      palavraMestra: sala.palavraMestre,
      subPalavras: sala.subPalavras,
    };

    res.render("gamescreen", { jogo, sala });
  } catch (err) {
    console.error("Erro ao carregar jogo:", err);
    res.status(500).send("Erro ao carregar jogo.");
  }
};

export const guardarEstatisticasPartida = async (req, res) => {
  try {
    const { codigoSala, pontuacao, palavrasEncontradas } = req.body;
    const userId = req.session.user.id;
    if (!codigoSala) {
      return res.status(400).json({ erro: "Código da sala em falta." });
    }
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
    res.status(500).json({ erro: "Erro ao guardar estatísticas." });
  }
};
