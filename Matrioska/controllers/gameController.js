"use strict";

import Palavra from "../models/Palavra.js";
import User from "../models/User.js";
import Lobby from "../models/Lobby.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Sanitiza e valida um código de sala (4-8 letras/dígitos) */
function sanitizarCodigo(raw) {
  if (typeof raw !== "string") return null;
  const limpo = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return limpo.length >= 2 && limpo.length <= 16 ? limpo : null;
}

/** Sanitiza uma tentativa de palavra (máx. 50 caracteres, só letras) */
function sanitizarPalavra(raw) {
  if (typeof raw !== "string") return null;
  const limpa = raw.trim().toUpperCase().replace(/[^A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]/g, "");
  return limpa.length >= 1 && limpa.length <= 50 ? limpa : null;
}

// ─── Rate Limiter em memória  ───────────────────────────────────

const rateLimits = new Map(); // key → { count, resetAt }
const RATE_WINDOW_MS = 5000;  // janela de 5 segundos
const RATE_MAX = 10;           // máx. 10 tentativas por janela

function verificarRateLimit(key) {
  const agora = Date.now();
  let entrada = rateLimits.get(key);
  if (!entrada || agora > entrada.resetAt) {
    entrada = { count: 1, resetAt: agora + RATE_WINDOW_MS };
    rateLimits.set(key, entrada);
    return false; // não bloqueado
  }
  entrada.count++;
  if (entrada.count > RATE_MAX) return true; // bloqueado
  return false;
}

// Limpeza periódica para não acumular entradas antigas em memória
setInterval(() => {
  const agora = Date.now();
  for (const [key, val] of rateLimits.entries()) {
    if (agora > val.resetAt) rateLimits.delete(key);
  }
}, 60_000);

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * Cria uma nova sala ou adiciona o jogador a uma sala existente
 */
export const criarOuEntrarSala = async (req, res) => {
  try {
    const { codigoSala, modoJogo, tempoJogo, idiomaJogo } = req.body;
    const user = req.session.user;
    const idiomaNormalizado = idiomaJogo === "en" ? "en" : "pt";
    if (!user) return res.redirect("/login");

    // validação do código de sala
    const codigoUpper = sanitizarCodigo(codigoSala);
    if (!codigoUpper) return res.redirect("/hub?error=invalid");

    let sala = await Lobby.findOne({ codigoSala: codigoUpper });

    const veioDeCriar =
      req.headers.referer && req.headers.referer.includes("create-match");

    if (sala) {
      if (sala.estado !== "lobby") return res.redirect("/hub?error=started");

      if (sala.modoJogo === "solo") {
        const jaEstaNaSala = sala.jogadores.find((j) => String(j.id) === String(user.id));
        if (!jaEstaNaSala) return res.redirect("/hub?error=solo_room");
      }

      if (sala.modoJogo === "multiplayer" && sala.jogadores.length >= 4) {
        return res.redirect("/hub?error=full");
      }

      const jaEstaNaSala = sala.jogadores.find((j) => String(j.id) === String(user.id));
      if (!jaEstaNaSala) {
        sala.jogadores.push({ id: user.id, username: user.username, avatar: user.avatar });
        await sala.save();
      }
    } else {
      if (veioDeCriar) {
        sala = new Lobby({
          codigoSala: codigoUpper,
          modoJogo: modoJogo || "multiplayer",
          idiomaJogo: idiomaNormalizado,
          estado: "lobby",
          tempoJogo: parseInt(tempoJogo, 10) || 30,
          jogadores: [{ id: user.id, username: user.username, avatar: user.avatar }],
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

    const sala = await Lobby.findOne({ codigoSala: codigo.toUpperCase() });
    if (!sala) return res.redirect("/hub");

    res.render("lobby", { sala, user: req.session.user });
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
    const rawUserId = req.session.user?._id || req.session.user?.id;
    if (!rawUserId) return res.status(401).json({ erro: "Sessão expirada." });

    // validação
    const codigoUpper = sanitizarCodigo(codigoSala);
    if (!codigoUpper) return res.status(400).json({ erro: "Código inválido." });

    const idUtilizadorAtual = String(rawUserId).trim();
    const sala = await Lobby.findOne({ codigoSala: codigoUpper }).lean();

    if (!sala) return res.status(404).json({ erro: "Sala não encontrada." });
    if (!sala.jogadores || sala.jogadores.length === 0)
      return res.status(400).json({ erro: "A sala está vazia." });

    const primeiroJogador = sala.jogadores[0];
    const idLider = String(primeiroJogador.id || primeiroJogador._id).trim();

    if (idLider !== idUtilizadorAtual) {
      return res.status(403).json({ erro: "Apenas o líder pode iniciar." });
    }

    const idiomaDaSala = sala.idiomaJogo || "pt";
    const contagem = await Palavra.countDocuments({ idioma: idiomaDaSala });

    if (contagem === 0) {
      return res.status(500).json({ erro: `Não existem palavras para o idioma ${idiomaDaSala}.` });
    }

    const random = Math.floor(Math.random() * contagem);
    const sorteada = await Palavra.findOne({ idioma: idiomaDaSala }).skip(random);

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

    const salaFinal = await Lobby.findById(sala._id);
    salaFinal.jogadores.forEach((j) => {
      j.pontuacao = 0;
      j.palavrasEncontradas = [];
      j.respostasErradas = 0;
      j.estatisticasEntregues = false; // flag explícita
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

    // rate limiting por userId+sala
    const rateKey = `${userId}:${codigoSala}`;
    if (verificarRateLimit(rateKey)) {
      return res.status(429).json({ erro: "Demasiadas tentativas. Abranda um pouco!" });
    }

    // sanitização
    const codigoUpper = sanitizarCodigo(codigoSala);
    const termoSubmetido = sanitizarPalavra(tentativa);

    if (!codigoUpper || !termoSubmetido) {
      return res.status(400).json({ erro: "Dados inválidos." });
    }

    const sala = await Lobby.findOne({ codigoSala: codigoUpper });

    if (!sala || sala.estado !== "em_jogo") {
      return res.status(404).json({ erro: "Partida não está ativa ou não existe." });
    }

    const palavraExiste = sala.subPalavras.some(
      (p) => p.trim().toUpperCase() === termoSubmetido
    );

    if (!palavraExiste) {
      return res.status(400).json({ status: "errada", mensagem: "Essa palavra não existe!" });
    }

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

    const pontosGanhos = termoSubmetido.length * 10;
    jogador.pontuacao = (jogador.pontuacao || 0) + pontosGanhos;
    jogador.palavrasEncontradas.push(termoSubmetido);

    const novoRegisto = { termo: termoSubmetido, username: jogador.username, pontos: pontosGanhos };
    sala.palavrasAcertadasRegisto.push(novoRegisto);

    sala.markModified("jogadores");
    sala.markModified("palavrasAcertadasRegisto");
    await sala.save();

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
 * Renderiza a tela de jogo principal
 * envia iniciadaEm e tempoJogo para o cliente poder sincronizar o timer
 */
export const renderizarJogo = async (req, res) => {
  try {
    const codigoSala = req.query.code;
    if (!codigoSala) return res.redirect("/hub");

    const sala = await Lobby.findOne({ codigoSala: codigoSala.trim().toUpperCase() });
    if (!sala) return res.redirect("/hub?error=notfound");
    if (sala.estado === "lobby") return res.redirect(`/lobby?code=${sala.codigoSala}`);

    // Calcular tempo restante no servidor para sincronizar todos os clientes
    let tempoRestanteServidor = sala.tempoJogo || 30;
    if (sala.iniciadaEm) {
      const decorrido = Math.floor((Date.now() - new Date(sala.iniciadaEm).getTime()) / 1000);
      tempoRestanteServidor = Math.max(0, sala.tempoJogo - decorrido);
    }

    const jogo = {
      palavraMestra: sala.palavraMestra,
      subPalavras: sala.subPalavras,
      tempoRestante: tempoRestanteServidor, // tempo sincronizado com o servidor
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
 * Guarda as estatísticas finais de um jogador após o término
 * usa flag `estatisticasEntregues` por jogador em vez de `pontuacao !== null`
 * só redireciona para o scoreboard depois de a API responder
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

    // rate limiting por userId para esta rota
    if (verificarRateLimit(`guardar:${userId}`)) {
      return res.status(429).json({ erro: "Pedido duplicado." });
    }

    // sanitização
    const codigoUpper = sanitizarCodigo(codigoSala);
    if (!codigoUpper || !userId) {
      return res.status(400).json({ erro: "Dados insuficientes." });
    }

    // Operação atómica: marca estatisticasEntregues apenas se ainda for false.
    // Evita a race condition onde dois pedidos simultâneos passam a verificação
    // ao mesmo tempo e um sobrescreve o outro.
    const salaAntes = await Lobby.findOneAndUpdate(
      {
        codigoSala: codigoUpper,
        "jogadores.id": userId,
        "jogadores.estatisticasEntregues": false,
      },
      {
        $set: {
          "jogadores.$.estatisticasEntregues": true,
          // No modo solo, os dados vêm do cliente (não há servidor a rastrear em tempo real).
          // No modo multiplayer, pontuacao e palavrasEncontradas já estão corretos
          // na BD (atualizados em tempo real pelo validarPalavraMultiplayer),
          // mas respostasErradas só existe no cliente — atualizamos sempre esse campo.
          "jogadores.$.respostasErradas": Number(respostasErradas) || 0,
        },
      },
      { new: false } // devolve o documento antes da atualização
    );

    // Se salaAntes for null, este jogador já entregou (ou não pertence à sala).
    // Pode acontecer com reconexões/pedidos duplicados — responde OK na mesma.
    if (!salaAntes) {
      // Verifica se a sala existe mesmo para distinguir "já entregou" de "sala não encontrada"
      const salaExiste = await Lobby.exists({ codigoSala: codigoUpper });
      if (!salaExiste) return res.status(404).json({ erro: "Partida não encontrada." });
      // Já entregou — responde 201 para o cliente navegar normalmente
      return res.status(201).json({ mensagem: "Estatísticas já guardadas." });
    }

    // No modo solo os dados vêm do cliente; no multiplayer apenas atualizamos
    // se o jogador ainda não tinha pontuação acumulada no servidor (ex: ficou AFK).
    const jogadorNaSala = salaAntes.jogadores.find(
      (j) => String(j.id || j._id) === userId
    );
    const eModoSolo = salaAntes.modoJogo === "solo";

    if (jogadorNaSala && eModoSolo) {
      // Solo: sobrescreve com os dados do cliente (fonte de verdade)
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
    // Multiplayer: pontuacao e palavrasEncontradas já estão corretos na BD;
    // apenas respostasErradas foi atualizado na operação atómica acima.

    // Lê o estado mais recente da sala para verificar se todos entregaram
    const salaAtual = await Lobby.findOne({ codigoSala: codigoUpper });
    if (!salaAtual) return res.status(201).json({ mensagem: "Estatísticas guardadas." });

    const jaFinalizada = salaAtual.estatisticasGuardadas;
    const todosEntregaram = salaAtual.jogadores.every((j) => j.estatisticasEntregues === true);

    if (todosEntregaram && !jaFinalizada) {
      // Marca como finalizada de forma atómica (evita dupla execução)
      const resultado = await Lobby.findOneAndUpdate(
        { _id: salaAtual._id, estatisticasGuardadas: false },
        { $set: { estatisticasGuardadas: true, estado: "finalizada", finalizadaEm: new Date() } },
        { new: true }
      );

      // Se resultado for null, outro pedido já marcou — não duplicar as atualizações de User
      if (resultado) {
        for (const jogador of resultado.jogadores) {
          const pontos = Number(jogador.pontuacao) || 0;
          const respostasCertas = Array.isArray(jogador.palavrasEncontradas)
            ? jogador.palavrasEncontradas.length
            : 0;
          const erradas = Number(jogador.respostasErradas) || 0;

          await User.findOneAndUpdate(
            { username: jogador.username },
            {
              $inc: {
                "stats.totalScore": pontos,
                "stats.correctAnswers": respostasCertas,
                "stats.wrongAnswers": erradas,
                "stats.gamesPlayed": 1,
              },
            }
          );
        }
        console.log(`[Stats] Partida ${codigoUpper} finalizada. Stats de ${resultado.jogadores.length} jogadores guardadas.`);
      }
    } else if (!jaFinalizada) {
      await Lobby.updateOne(
        { _id: salaAtual._id },
        { $set: { estado: "finalizada", finalizadaEm: new Date() } }
      );
    }

    // responde com 201 → o cliente só navega após receber esta resposta
    res.status(201).json({ mensagem: "Estatísticas guardadas." });
  } catch (err) {
    console.error("Erro ao guardar estatísticas:", err);
    res.status(500).json({ erro: "Erro interno ao guardar dados." });
  }
};

export const obterScoreboardPartida = async (req, res) => {
  try {
    const { codigoSala } = req.params;
    if (!codigoSala) return res.status(400).json({ erro: "Código da sala em falta." });

    const sala = await Lobby.findOne({
      codigoSala: codigoSala.trim().toUpperCase(),
    }).lean();

    if (!sala) return res.status(404).json({ erro: "Partida não encontrada." });

    const ranking = sala.jogadores
      .map((jogador) => ({
        username: jogador.username,
        avatar: jogador.avatar,
        pontuacao: jogador.pontuacao || 0,
        palavrasCertas: jogador.palavrasEncontradas?.length || 0,
        respostasErradas: jogador.respostasErradas || 0,
      }))
      .sort((a, b) => b.pontuacao - a.pontuacao);

    res.status(200).json({ codigoSala: sala.codigoSala, ranking, vencedor: ranking[0] || null });
  } catch (err) {
    console.error("Erro ao obter scoreboard:", err);
    res.status(500).json({ erro: "Erro ao obter scoreboard." });
  }
};

/**
 * Reinicia a sala para o estado de lobby mantendo os mesmos jogadores
 * reseta iniciadaEm
 */
export const reiniciarLobby = async (req, res, io) => {
  try {
    const { codigoSala } = req.body;
    const rawUserId = req.session.user?._id || req.session.user?.id;

    // validação
    const codigoUpper = sanitizarCodigo(codigoSala);
    if (!codigoUpper || !rawUserId)
      return res.status(400).json({ erro: "Dados inválidos." });

    const idUtilizadorAtual = String(rawUserId).trim();
    const sala = await Lobby.findOne({ codigoSala: codigoUpper });
    if (!sala) return res.status(404).json({ erro: "Sala não encontrada." });

    const idLider = String(sala.jogadores[0]?.id || sala.jogadores[0]?._id).trim();
    if (idLider !== idUtilizadorAtual) {
      return res.status(403).json({ erro: "Apenas o líder pode reiniciar o lobby." });
    }

    sala.estado = "lobby";
    sala.palavraMestra = "";
    sala.subPalavras = [];
    sala.palavrasAcertadasRegisto = [];
    sala.estatisticasGuardadas = false;
    sala.finalizadaEm = null;
    sala.iniciadaEm = null; // limpar iniciadaEm

    sala.jogadores.forEach((j) => {
      j.pontuacao = 0;
      j.palavrasEncontradas = [];
      j.respostasErradas = 0;
      j.estatisticasEntregues = false; // resetar flag
    });

    await sala.save();

    if (io) {
      io.to(codigoUpper).emit("voltar-ao-lobby", codigoUpper);
      // Emite room-update com a lista já limpa (sem jogadores que saíram do scoreboard)
      // para que o lobby-manager atualize a lista visual correctamente ao carregar.
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
 * Devolve o username do líder atual da sala
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