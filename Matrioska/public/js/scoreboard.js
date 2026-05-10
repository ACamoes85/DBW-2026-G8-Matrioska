"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const resultado = JSON.parse(localStorage.getItem("resultadoPartida"));

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
    );

    if (!resposta.ok) {
      throw new Error("Erro ao obter classificação da partida.");
    }

    const dados = await resposta.json();

    if (!dados.ranking || dados.ranking.length === 0) {
      displayVencedor.innerText = "Sem jogadores registados";
      rankingList.innerHTML = "";
      return;
    }

    const vencedor = dados.vencedor;

    displayVencedor.innerText = `${vencedor.username} - ${vencedor.pontuacao} pts`;

    rankingList.innerHTML = "";

    dados.ranking.forEach((jogador, index) => {
      const linha = document.createElement("p");

      linha.innerText =
        `${index + 1}. ${jogador.username} - ` +
        `${jogador.pontuacao} pts ` +
        `(${jogador.palavrasCertas} certas, ${jogador.respostasErradas} erradas)`;

      rankingList.appendChild(linha);
    });
  } catch (err) {
    console.error("Erro ao carregar scoreboard:", err);

    displayVencedor.innerText = `Tu - ${resultado.pontuacao || 0} pts`;

    rankingList.innerHTML = `
            <p>1. Tu - ${resultado.pontuacao || 0} pts</p>
        `;
  }
});
