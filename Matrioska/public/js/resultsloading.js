"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // Simulamos um tempo de carregamento de 2.5 segundos
    // para dar efeito de que os resultados estão a ser processados
    setTimeout(() => {
        window.location.href = "/scoreboard";
    }, 2500);
});