"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const resultado = JSON.parse(localStorage.getItem("resultadoPartida") || "null");

  const displayVencedor = document.getElementById("winner-display");
  const rankingList = document.getElementById("ranking-list");

  if (!displayVencedor || !rankingList) return;

  if (!resultado || !resultado.codigoSala) {
    displayVencedor.innerText = "Sem dados da partida";
    rankingList.innerHTML = "";
    return;
  }

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
});