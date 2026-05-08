"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Vai buscar os resultados guardados no final do jogo
    const resultado = JSON.parse(localStorage.getItem("resultadoPartida"));
    const user = localStorage.getItem("user") || "Jogador"; // Nome do utilizador

    const displayVencedor = document.getElementById("winner-display");
    const rankingList = document.getElementById("ranking-list");

    if (resultado && displayVencedor) {
        // Mostra o nome e a pontuação real
        displayVencedor.innerText = `${user} - ${resultado.pontuacao} pts`;

        // No modo Solo, a classificação é apenas o próprio jogador
        if (rankingList) {
            rankingList.innerHTML = `<p>1. ${user} - ${resultado.pontuacao} pts</p>`;
        }
    } else {
        if (displayVencedor) displayVencedor.innerText = "Sem dados da partida";
    }
});