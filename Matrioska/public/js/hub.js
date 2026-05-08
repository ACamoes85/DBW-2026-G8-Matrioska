/* Botão Entrar para /lobby */
document.addEventListener("DOMContentLoaded", () => {
    // Garante que o idioma é aplicado ao carregar o Hub
    if (typeof aplicarIdioma === "function") {
        aplicarIdioma();
    }

    const btnEnter = document.getElementById("btn-enter-room");

    if (btnEnter) {
        btnEnter.addEventListener("click", () => {
            window.location.href = "/lobby";
        });
    }
});