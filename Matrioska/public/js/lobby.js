document.addEventListener("DOMContentLoaded", () => {
    carregarDadosLobby();
    configurarBotaoIniciar();
});

function carregarDadosLobby() {
    const codigoSala = localStorage.getItem("codigoSalaAtual");
    const modoJogo = localStorage.getItem("modoJogo");
    const tempoLimite = localStorage.getItem("tempoLimite");
    const username = localStorage.getItem("user");

    const displayLobby = document.querySelector(".lobby-code .code-display");
    const displayUsername = document.getElementById("player-username-display");

    if (displayLobby && codigoSala) {
        displayLobby.innerText = codigoSala;
    }

    if (displayUsername && username) {
        displayUsername.innerText = username;
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
            modo: modoJogo,
            tempo: tempoLimite,
            codigo: codigoSala
        };

        localStorage.setItem("partidaAtual", JSON.stringify(partidaAtual));

        window.location.href = "/gamescreen";
    });
}