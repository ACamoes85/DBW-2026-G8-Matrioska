"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const resultado = JSON.parse(localStorage.getItem("resultadoPartida") || "null");

  const displayVencedor = document.getElementById("winner-display");
  const rankingList = document.getElementById("ranking-list");
  const btnPlayAgain = document.getElementById("btn-play-again");

  // Iniciar socket para ouvir o redirecionamento global
  const socket = io();

  if (!displayVencedor || !rankingList) return;

  if (!resultado || !resultado.codigoSala) {
    displayVencedor.innerText = "Sem dados da partida";
    rankingList.innerHTML = "";
    return;
  }

  // Entrar na sala do socket para receber o evento de reset
  socket.emit("join-room", { roomCode: resultado.codigoSala.toUpperCase() });

  // Ouvir o evento emitido pelo servidor para voltar ao lobby
  socket.on("voltar-ao-lobby", (codigo) => {
    window.location.href = `/lobby?code=${codigo}`;
  });

  try {
    const resposta = await fetch(
      `/api/partidas/${resultado.codigoSala}/scoreboard`,
      {
        cache: "no-store",
      },
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Erro ao obter classificação.");
    }

    if (!dados.ranking || dados.ranking.length === 0) {
      displayVencedor.innerText = "Sem jogadores registados";
      rankingList.innerHTML = "";
      return;
    }

    const vencedor = dados.vencedor;

    displayVencedor.innerText = `${vencedor.username} - ${vencedor.pontuacao} pts`;

    rankingList.innerHTML = dados.ranking
      .map(
        (jogador, index) => `
          <p>
            ${index + 1}. ${jogador.username} - ${jogador.pontuacao} pts
            <br>
            <small>
              ${jogador.palavrasCertas} certas, ${jogador.respostasErradas} erradas
            </small>
          </p>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Erro ao carregar scoreboard:", err);

    displayVencedor.innerText = "Erro ao carregar classificação";
    rankingList.innerHTML = "";
  }

  // Lógica do botão Jogar Novamente
  if (btnPlayAgain) {
    btnPlayAgain.addEventListener("click", async () => {
      try {
        const response = await fetch("/api/match/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigoSala: resultado.codigoSala })
        });

        const data = await response.json();

        if (!response.ok) {
          // Se o servidor negar, mudamos o estado do botão
          btnPlayAgain.innerText = "À espera do líder...";
          btnPlayAgain.disabled = true;
          btnPlayAgain.style.opacity = "0.6";
          btnPlayAgain.style.cursor = "not-allowed";
        }

      } catch (err) {
        console.error("Erro ao solicitar reinício:", err);
      }
    });
  }
});