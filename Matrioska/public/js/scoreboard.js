"use strict";

function t(chave) {
  return window.getTexto ? window.getTexto(chave) : chave;
}

function plural(numero, singular, plural) {
  return Number(numero) === 1 ? singular : plural;
}

function bloquearJogarNovamente(btnPlayAgain, mensagem) {
  if (!btnPlayAgain) return;
  btnPlayAgain.disabled = true;
  btnPlayAgain.style.opacity = "0.5";
  btnPlayAgain.style.cursor = "not-allowed";
  btnPlayAgain.innerText = mensagem || t("leaderLeft");
}

function mostrarAviso(mensagem) {
  let el = document.getElementById("scoreboard-aviso");
  if (!el) {
    el = document.createElement("p");
    el.id = "scoreboard-aviso";
    el.style.cssText = "color:#ff6b6b;background:rgba(255,80,80,0.1);border:1px solid rgba(255,80,80,0.3);border-radius:8px;padding:10px 14px;font-weight:600;text-align:center;margin-bottom:12px;";
    const buttons = document.querySelector(".buttons");
    if (buttons) buttons.before(el);
  }
  el.innerText = mensagem;
}

document.addEventListener("DOMContentLoaded", async () => {
  const resultado = JSON.parse(localStorage.getItem("resultadoPartida") || "null");

  const displayVencedor = document.getElementById("winner-display");
  const rankingList = document.getElementById("ranking-list");
  const btnPlayAgain = document.getElementById("btn-play-again");

  const socket = io();

  if (!displayVencedor || !rankingList) return;

  if (!resultado || !resultado.codigoSala) {
    displayVencedor.innerText = t("noMatchData");
    rankingList.innerHTML = "";
    return;
  }

  // Verifica se o líder saiu durante o jogo (flag guardada pelo gamescreen)
  const liderSaiu = localStorage.getItem("lider-saiu") === "1";
  if (liderSaiu) {
    localStorage.removeItem("lider-saiu");
    mostrarAviso(t("leaderLeftGame", "O líder saiu durante o jogo. Não é possível jogar novamente."));
    bloquearJogarNovamente(btnPlayAgain);
  }

  // Entra na sala para receber eventos em tempo real
  socket.emit("join-room", { roomCode: resultado.codigoSala.toUpperCase() });

  // Líder saiu durante o scoreboard
  socket.on("lider-saiu-jogo", () => {
    mostrarAviso(t("leaderLeftGame", "O líder saiu. Não é possível jogar novamente."));
    bloquearJogarNovamente(btnPlayAgain);
  });

  // Voltar ao lobby (emitido pelo servidor quando o líder clica em Jogar Novamente)
  socket.on("voltar-ao-lobby", (codigo) => {
    localStorage.removeItem("lider-saiu");
    window.location.href = `/lobby?code=${codigo}`;
  });

  try {
    const resposta = await fetch(`/api/partidas/${resultado.codigoSala}/scoreboard`, { cache: "no-store" });
    const dados = await resposta.json();

    if (!resposta.ok) throw new Error(dados.erro || t("scoreboardLoadError"));

    if (!dados.ranking || dados.ranking.length === 0) {
      displayVencedor.innerText = t("noRegisteredPlayers");
      rankingList.innerHTML = "";
      return;
    }

    displayVencedor.dataset.loaded = "true";
    displayVencedor.innerText = `${dados.vencedor.username} - ${dados.vencedor.pontuacao} pts`;

    rankingList.innerHTML = dados.ranking.map((jogador, index) => `
      <p>
        ${index + 1}. ${jogador.username} - ${jogador.pontuacao} pts
        <br>
        <small>
          ${jogador.palavrasCertas} ${plural(jogador.palavrasCertas, t("correctSingular"), t("correctPlural"))}, 
          ${jogador.respostasErradas} ${plural(jogador.respostasErradas, t("wrongSingular"), t("wrongPlural"))}
        </small>
      </p>
    `).join("");

    // O líder é sempre o primeiro jogador da sala na DB
    // Verifica se o utilizador atual é o líder
    const meuUsername = localStorage.getItem("user") || "";
    const souLider = dados.ranking.length > 0 && !liderSaiu &&
      dados.vencedor !== null && dados.ranking[0] &&
      // Busca o primeiro jogador da sala via API — usa o codigoSala para confirmar
      meuUsername === (await fetch(`/api/partidas/${resultado.codigoSala}/lider`)
        .then(r => r.ok ? r.json() : { username: null })
        .then(d => d.username)
        .catch(() => null));

    if (!liderSaiu) {
      if (souLider) {
        btnPlayAgain.disabled = false;
        btnPlayAgain.style.opacity = "1";
        btnPlayAgain.style.cursor = "pointer";
      } else {
        bloquearJogarNovamente(btnPlayAgain, t("waitingLeader", "À espera do líder..."));
      }
    }

  } catch (err) {
    console.error("Erro ao carregar scoreboard:", err);
    displayVencedor.innerText = t("scoreboardLoadError");
    rankingList.innerHTML = "";
  }

  if (btnPlayAgain) {
    btnPlayAgain.addEventListener("click", async () => {
      if (btnPlayAgain.disabled) return;
      try {
        const response = await fetch("/api/match/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigoSala: resultado.codigoSala }),
        });
        if (!response.ok) {
          bloquearJogarNovamente(btnPlayAgain, t("waitingLeader", "À espera do líder..."));
        }
      } catch (err) {
        console.error("Erro ao solicitar reinício:", err);
      }
    });
  }
});