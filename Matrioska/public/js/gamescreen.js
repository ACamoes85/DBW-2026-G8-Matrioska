"use strict";

document.addEventListener("DOMContentLoaded", () => {
  inicializarJogo();
  configurarSubmissaoPalavras();
  iniciarTemporizador();
});

let palavraMestreAtual = "";
let palavrasValidasAtuais = [];
let palavrasEncontradas = [];
let pontuacao = 0;
let tempoRestante = 30;
let intervaloTemporizador = null;

function inicializarJogo() {
  // 1. Carrega os dados que o EJS "imprimiu" na página vindos do MongoDB
  if (window.DADOS_JOGO) {
    palavraMestreAtual = window.DADOS_JOGO.palavraMestra.toUpperCase().trim();
    // Garantimos que todas as subpalavras da BD estão em maiúsculas e sem espaços a mais
    palavrasValidasAtuais = window.DADOS_JOGO.subPalavras.map((p) =>
      p.toUpperCase().trim(),
    );

    console.log("Jogo Iniciado!");
    console.log("Palavra-mestra:", palavraMestreAtual);
    console.log(
      "Palavras que o jogador deve adivinhar:",
      palavrasValidasAtuais,
    );
  }

  // 2. Recupera dados da partida (como o tempo definido no lobby)
  const partidaAtual = JSON.parse(localStorage.getItem("partidaAtual"));

  if (!partidaAtual) {
    window.location.href = "/create-match";
    return;
  }
  const elTimer = document.getElementById("game-timer");
  const elRoomCode = document.getElementById("game-room-code");
  const elMasterWord = document.getElementById("master-word");
  const elScore = document.getElementById("score-display");
  const elMode = document.getElementById("game-mode-display");

  if (partidaAtual) {
    tempoRestante = parseInt(partidaAtual.tempo, 10) || 30;
    if (elTimer) elTimer.innerText = `${tempoRestante}s`;
    if (elRoomCode) elRoomCode.innerText = partidaAtual.codigo || "SOLO";
    if (elMode) {
      elMode.innerText =
        partidaAtual.modo === "multiplayer"
          ? "Modo: Multijogador"
          : "Modo: Solo";
    }
  }

  if (elMasterWord) elMasterWord.innerText = palavraMestreAtual;
  if (elScore) elScore.innerText = `Pontuação: ${pontuacao}`;
}

function configurarSubmissaoPalavras() {
  const input = document.getElementById("player-word");
  const button = document.getElementById("submit-word-btn");

  if (button) {
    button.onclick = submeterPalavra;
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

function submeterPalavra() {
  const input = document.getElementById("player-word");
  const feedback = document.getElementById("feedback-message");
  const listaUI = document.getElementById("found-words-list");
  const scoreDisplay = document.getElementById("score-display");

  if (!input) return;

  const tentativa = input.value.trim().toUpperCase();

  // Validações básicas
  if (!tentativa) return;

  if (palavrasEncontradas.includes(tentativa)) {
    feedback.innerText = "Já encontraste essa!";
    feedback.style.color = "orange";
    input.value = "";
    return;
  }

  // A REGRA DE OURO: A tentativa está na lista de subPalavras do MongoDB?
  if (palavrasValidasAtuais.includes(tentativa)) {
    // Sucesso!
    palavrasEncontradas.push(tentativa);

    // Atribui pontos (ex: 10 pontos por letra)
    const pontosGanhos = tentativa.length * 10;
    pontuacao += pontosGanhos;

    // Atualiza a interface (UI)
    const item = document.createElement("li");
    item.innerText = `${tentativa} (+${pontosGanhos})`;
    listaUI.appendChild(item);

    if (scoreDisplay) scoreDisplay.innerText = `Pontuação: ${pontuacao}`;

    feedback.innerText = "Acertaste!";
    feedback.style.color = "#00FF00"; // Verde
  } else {
    // Erro: A palavra não consta na tua lista do Atlas
    feedback.innerText = "Palavra incorreta!";
    feedback.style.color = "#FF4444"; // Vermelho
  }

  // Limpa o campo e foca para a próxima tentativa
  input.value = "";
  input.focus();
  setTimeout(() => {
    feedback.innerText = "";
  }, 1500);
}

function iniciarTemporizador() {
  const elTimer = document.getElementById("game-timer");
  if (!elTimer) return;

  intervaloTemporizador = setInterval(() => {
    tempoRestante--;
    elTimer.innerText = `${tempoRestante}s`;

    if (tempoRestante <= 0) {
      clearInterval(intervaloTemporizador);
      finalizarPartida();
    }
  }, 1000);
}

async function finalizarPartida() {
  const partidaAtual = JSON.parse(localStorage.getItem("partidaAtual"));

  const resultadoPartida = {
    codigoSala: partidaAtual?.codigo || "SOLO",
    palavraMestre: palavraMestreAtual,
    palavrasEncontradas,
    pontuacao,
    tempoJogo: parseInt(partidaAtual?.tempo, 10) || 30,
  };

  localStorage.setItem("resultadoPartida", JSON.stringify(resultadoPartida));

  try {
    const resposta = await fetch("/api/partidas/guardar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resultadoPartida),
    });

    if (!resposta.ok) {
      console.error("Erro na resposta ao guardar partida.");
    }
  } catch (err) {
    console.error("Erro ao guardar partida:", err);
  }

  window.location.href = "/resultsloading";
}
