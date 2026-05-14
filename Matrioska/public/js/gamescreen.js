"use strict";
const t = (chave, fallback) => {
  return window.texto ? window.texto(chave) : fallback;
};

// Instância única de socket para este ficheiro
const socket = io();

document.addEventListener("DOMContentLoaded", () => {
  console.log("Game Screen carregada. Inicializando...");
  inicializarJogo();
  configurarSubmissaoPalavras();
  configurarSocketMultiplayer();
  iniciarTemporizador();
});

let palavraMestraAtual = "";
let palavrasValidasAtuais = [];
let palavrasEncontradas = [];
let pontuacao = 0;
let respostasErradas = 0;
let tempoRestante = 30;
let intervaloTemporizador = null;

function inicializarJogo() {
  // Limpa flags de sessões anteriores
  localStorage.removeItem("lider-saiu");
  if (window.DADOS_JOGO) {
    palavraMestraAtual = (window.DADOS_JOGO.palavraMestra || "")
      .toUpperCase()
      .trim();
    const listaSujas = window.DADOS_JOGO.subPalavras || [];

    palavrasValidasAtuais = listaSujas.map((p) =>
      p.toString().toUpperCase().trim(),
    );

    // usar tempo restante calculado no servidor (sincronizado entre clientes)
    tempoRestante = parseInt(window.DADOS_JOGO.tempoRestante, 10);
    if (isNaN(tempoRestante) || tempoRestante < 0) tempoRestante = parseInt(window.DADOS_JOGO.tempoInicial, 10) || 30;
  }

  const elTimer = document.getElementById("game-timer");
  const elMasterWord = document.getElementById("master-word");
  const elScore = document.getElementById("score-display");
  const elModo = document.getElementById("game-mode-display");

  if (elTimer) elTimer.innerText = `${tempoRestante}s`;
  if (elMasterWord) elMasterWord.innerText = palavraMestraAtual;
  if (elScore)
    elScore.innerText = `${t("scorePrefix", "Pontuação:")} ${pontuacao}`;

  if (elModo && window.DADOS_JOGO) {
    const modoTraduzido =
      window.DADOS_JOGO.modoJogo === "multiplayer"
        ? t("gameModeMultiplayer", "Multijogador")
        : t("gameModeSolo", "Solo");

    elModo.innerText = `${t("gameModePrefix", "Modo:")} ${modoTraduzido}`;
  }

  const elHiddenCode = document.getElementById("room-code-hidden");
  const elRoomCodeDisplay = document.getElementById("game-room-code");

  if (elRoomCodeDisplay && elHiddenCode) {
    elRoomCodeDisplay.innerText = elHiddenCode.value || "SOLO";
  }
}

function configurarSocketMultiplayer() {
  if (window.DADOS_JOGO && window.DADOS_JOGO.modoJogo === "multiplayer") {
    const roomCode = document.getElementById("room-code-hidden").value;

    socket.emit("join-room", {
      roomCode: roomCode,
      user: {
        id: window.DADOS_JOGO.userId,
        username: window.DADOS_JOGO.username,
      },
    });

    // Guarda o líder atual no localStorage para o scoreboard saber quem pode reiniciar
    socket.on("novo-lider", ({ novoLiderId }) => {
      localStorage.setItem("liderSala", String(novoLiderId));
    });

    // Líder saiu durante o jogo — guarda aviso para mostrar no scoreboard
    socket.on("lider-saiu-jogo", () => {
      localStorage.setItem("lider-saiu", "1");
    });

    socket.on("palavra-descoberta-global", (data) => {
      const listaUI = document.getElementById("found-words-list");
      if (!listaUI) return;

      const idExistente = `word-${data.registo.termo.toLowerCase()}`;
      if (document.getElementById(idExistente)) return;

      const item = document.createElement("li");
      item.id = idExistente;

      // --- Lógica de Diferenciação Visual ---
      const souEu = String(data.userId) === String(window.DADOS_JOGO.userId);

      // Estilo do item
      item.style.padding = "10px";
      item.style.marginBottom = "8px";
      item.style.borderRadius = "6px";
      item.style.listStyle = "none";
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.fontWeight = "bold";
      item.style.borderLeft = "5px solid";

      if (souEu) {
        // Estilo para as nossas palavras
        item.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
        item.style.borderColor = "#00FF00"; // Verde
        item.style.color = "#00FF00";
      } else {
        // Estilo para as palavras dos adversários
        item.style.backgroundColor = "rgba(0, 229, 255, 0.1)";
        item.style.borderColor = "#00E5FF"; // Ciano
        item.style.color = "#00E5FF";
      }

      const nomeExibicao = souEu ? t("youLabel", "Tu") : data.registo.username;

      item.innerHTML = `
                <span>${data.registo.termo} <small>(+${data.registo.pontos})</small></span>
                <span style="font-size: 0.8em; opacity: 0.7;">${nomeExibicao}</span>
            `;

      listaUI.prepend(item);

      // Atualização local de pontos
      if (souEu) {
        pontuacao = data.pontuacaoAtualizada;
        if (!palavrasEncontradas.includes(data.registo.termo)) {
          palavrasEncontradas.push(data.registo.termo);
        }
        const elScore = document.getElementById("score-display");
        if (elScore)
          elScore.innerText = `${t("scorePrefix", "Pontuação:")} ${pontuacao}`;
      }
    });
  }
}

function configurarSubmissaoPalavras() {
  const input = document.getElementById("player-word");
  const button = document.getElementById("submit-word-btn");

  if (button) {
    button.onclick = (e) => {
      e.preventDefault();
      submeterPalavra();
    };
  }

  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submeterPalavra();
      }
    });
  }
}

async function submeterPalavra() {
  const input = document.getElementById("player-word");
  if (!input) return;

  const tentativa = input.value.trim().toUpperCase();
  if (!tentativa || tempoRestante <= 0) return;

  if (window.DADOS_JOGO && window.DADOS_JOGO.modoJogo === "multiplayer") {
    try {
      const roomCode = document.getElementById("room-code-hidden").value;
      const response = await fetch("/api/match/validate-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoSala: roomCode,
          tentativa: tentativa,
          userId: window.DADOS_JOGO.userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.status === "errada") {
          respostasErradas++;
          mostrarFeedback(
            t("invalidWordFeedback", "Palavra incorreta!"),
            "#FF4444",
          );
        } else if (data.status === "repetida") {
          mostrarFeedback(
            t("repeatedWordFeedback", "Essa palavra já foi encontrada."),
            "orange",
          );
        } else {
          mostrarFeedback(
            data.mensagem || t("connectionError", "Erro de ligação"),
            "#FF4444",
          );
        }
      } else {
        mostrarFeedback(t("correctFeedback", "Acertaste!"), "#00FF00");
      }
    } catch (err) {
      console.error("Erro na comunicação API:", err);
      mostrarFeedback(t("connectionError", "Erro de ligação"), "red");
    }
  } else {
    // Lógica Solo
    const listaUI = document.getElementById("found-words-list");
    if (palavrasEncontradas.includes(tentativa)) {
      mostrarFeedback(
        t("repeatedWordFeedback", "Essa palavra já foi encontrada."),
        "orange",
      );
    } else if (palavrasValidasAtuais.includes(tentativa)) {
      palavrasEncontradas.push(tentativa);
      const pontosGanhos = tentativa.length * 10;
      pontuacao += pontosGanhos;

      const item = document.createElement("li");
      item.innerText = `${tentativa} (+${pontosGanhos})`;
      if (listaUI) listaUI.prepend(item);

      const elScore = document.getElementById("score-display");
      if (elScore) elScore.innerText = `${t("scorePrefix", "Pontuação:")} ${pontuacao}`;
      mostrarFeedback(t("correctFeedback", "Acertaste!"), "#00FF00");
    } else {
      respostasErradas++;
      mostrarFeedback(
        t("invalidWordFeedback", "Palavra incorreta!"),
        "#FF4444",
      );
    }
  }

  input.value = "";
  input.focus();
}

function mostrarFeedback(msg, cor) {
  const feedback = document.getElementById("feedback-message");
  if (!feedback) return;
  feedback.innerText = msg;
  feedback.style.color = cor;
  setTimeout(() => {
    if (feedback.innerText === msg) feedback.innerText = "";
  }, 1500);
}

function iniciarTemporizador() {
  const elTimer = document.getElementById("game-timer");
  if (!elTimer) return;
  if (intervaloTemporizador) clearInterval(intervaloTemporizador);

  intervaloTemporizador = setInterval(() => {
    tempoRestante--;
    if (tempoRestante >= 0) elTimer.innerText = `${tempoRestante}s`;
    if (tempoRestante <= 0) {
      clearInterval(intervaloTemporizador);
      finalizarPartida();
    }
  }, 1000);
}

async function finalizarPartida() {
  const roomCodeEl = document.getElementById("room-code-hidden");
  const roomCode = roomCodeEl ? roomCodeEl.value : "";

  const resultadoPartida = {
    codigoSala: roomCode,
    palavraMestra: palavraMestraAtual,
    palavrasEncontradas,
    pontuacao,
    respostasErradas,
    userId: window.DADOS_JOGO ? window.DADOS_JOGO.userId : null,
    username: window.DADOS_JOGO ? window.DADOS_JOGO.username : null,
  };

  // Garante que os dados estão no storage antes de mudar de página
  localStorage.setItem("resultadoPartida", JSON.stringify(resultadoPartida));

  try {
    // só navega para o scoreboard após a API confirmar que guardou
    const response = await fetch("/api/partidas/guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultadoPartida),
    });

    if (response.ok) {
      console.log("Estatísticas guardadas com sucesso.");
    } else {
      console.warn("Aviso: servidor não confirmou guardar estatísticas.");
    }
  } catch (err) {
    console.error("Erro ao guardar:", err);
  }

  // Navega só depois da API responder (com sucesso ou não)
  window.location.href = "/resultsloading";
}