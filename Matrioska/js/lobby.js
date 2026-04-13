document.addEventListener("DOMContentLoaded", () => {
    carregarCodigoNoLobby();
});

/* Função para carregar o código na página do Lobby */
function carregarCodigoNoLobby() {
    const displayLobby = document.querySelector(".lobby-code .code-display");
    const codigoSalvo = localStorage.getItem("codigoSalaAtual");

    if (displayLobby && codigoSalvo) {
        displayLobby.innerText = codigoSalvo;
    }
}