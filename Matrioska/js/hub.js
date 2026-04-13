/* Botão Entrar para Lobby.html */
document.addEventListener("DOMContentLoaded", () => {
    aplicarIdioma();

    const btnEnter = document.getElementById("btn-enter-room");

    if (btnEnter) {
        btnEnter.addEventListener("click", () => {
            window.location.href = "lobby.html";
        });
    }
});