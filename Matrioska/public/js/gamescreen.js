"use strict";

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
  if (window.DADOS_JOGO) {
    palavraMestraAtual = (window.DADOS_JOGO.palavraMestra || "")
      .toUpperCase()
      .trim();
    const listaSujas = window.DADOS_JOGO.subPalavras || [];

    palavrasValidasAtuais = listaSujas.map((p) =>
      p.toString().toUpperCase().trim(),
    );

    tempoRestante = parseInt(window.DADOS_JOGO.tempoInicial, 10) || 30;
  }

  const elTimer = document.getElementById("game-timer");
  const elMasterWord = document.getElementById("master-word");
  const elScore = document.getElementById("score-display");

  if (elTimer) elTimer.innerText = `${tempoRestante}s`;
  if (elMasterWord) elMasterWord.innerText = palavraMestraAtual;
  if (elScore) elScore.innerText = `Pontuação: ${pontuacao}`;

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
        // Estilo para as TUAS palavras
        item.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
        item.style.borderColor = "#00FF00"; // Verde
        item.style.color = "#00FF00";
      } else {
        // Estilo para as palavras dos ADVERSÁRIOS
        item.style.backgroundColor = "rgba(0, 229, 255, 0.1)";
        item.style.borderColor = "#00E5FF"; // Ciano
        item.style.color = "#00E5FF";
      }

      const nomeExibicao = souEu ? "Tu" : data.registo.username;

      item.innerHTML = `
                <span>${data.registo.termo} <small>(+${data.registo.pontos})</small></span>
                <span style="font-size: 0.8em; opacity: 0.7;">${nomeExibicao}</span>
            `;

      listaUI.prepend(item);

      // Atualização local de pontos (apenas se fui eu)
      if (souEu) {
        pontuacao = data.pontuacaoAtualizada;
        if (!palavrasEncontradas.includes(data.registo.termo)) {
          palavrasEncontradas.push(data.registo.termo);
        }
        const elScore = document.getElementById("score-display");
        if (elScore) elScore.innerText = `Pontuação: ${pontuacao}`;
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
        }
        mostrarFeedback(data.mensagem || "Erro ao validar", "#FF4444");
      } else {
        mostrarFeedback("Acertaste!", "#00FF00");
      }
    } catch (err) {
      console.error("Erro na comunicação API:", err);
      mostrarFeedback("Erro de ligação", "red");
    }
  } else {
    // Lógica Solo
    const listaUI = document.getElementById("found-words-list");
    if (palavrasEncontradas.includes(tentativa)) {
      mostrarFeedback("Já encontraste essa!", "orange");
    } else if (palavrasValidasAtuais.includes(tentativa)) {
      palavrasEncontradas.push(tentativa);
      const pontosGanhos = tentativa.length * 10;
      pontuacao += pontosGanhos;

      const item = document.createElement("li");
      item.innerText = `${tentativa} (+${pontosGanhos})`;
      if (listaUI) listaUI.prepend(item);

      const elScore = document.getElementById("score-display");
      if (elScore) elScore.innerText = `Pontuação: ${pontuacao}`;
      mostrarFeedback("Acertaste!", "#00FF00");
    } else {
    respostasErradas++;
    mostrarFeedback("Palavra incorreta!", "#FF4444");
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
    respostasErradas
  };

  localStorage.setItem("resultadoPartida", JSON.stringify(resultadoPartida));

  try {
    await fetch("/api/partidas/guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultadoPartida),
    });
  } catch (err) {
    console.error("Erro ao guardar:", err);
  }

  setTimeout(() => {
    window.location.href = "/resultsloading";
  }, 1000);
}
