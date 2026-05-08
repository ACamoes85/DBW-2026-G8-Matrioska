"use strict";

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosLobby();
    configurarBotaoIniciar();
});

function carregarDadosLobby() {
    const codigoSala = localStorage.getItem("codigoSalaAtual");
    // Removida a leitura do username do localStorage para não causar conflitos com o servidor
    const displayLobby = document.querySelector(".lobby-code .code-display");

    if (displayLobby && codigoSala) {
        displayLobby.innerText = codigoSala;
    }
}

function configurarBotaoIniciar() {
    const btnIniciar = document.getElementById("btn-start-match");
    if (!btnIniciar) return;

    btnIniciar.addEventListener("click", () => {
        const modoJogo = localStorage.getItem("modoJogo");
        const tempoLimite = localStorage.getItem("tempoLimite");
        const codigoSala = localStorage.getItem("codigoSalaAtual");

        const partidaAtual = {
            modo: modoJogo || "solo",
            tempo: tempoLimite || 30,
            codigo: codigoSala || "X7K9P2"
        };

        localStorage.setItem("partidaAtual", JSON.stringify(partidaAtual));
        window.location.href = "/loadingmatch"; 
    });
}