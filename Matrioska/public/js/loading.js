"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // Tenta apanhar o código da URL atual (?code=XXXX)
    const params = new URLSearchParams(window.location.search);
    let codigoSala = params.get("code");

    // Se não estiver na URL, tenta ler do HTML (injetado pelo EJS)
    if (!codigoSala) {
        const elRoomCode = document.getElementById("display-room-code");
        if (elRoomCode && elRoomCode.innerText.trim() !== "X7K9P2") {
            codigoSala = elRoomCode.innerText.trim();
        }
    }

    console.log("[Loading] Código detetado:", codigoSala);

    setTimeout(() => {
        if (codigoSala && codigoSala !== "X7K9P2") {
            // REDIRECIONA COM O CÓDIGO REAL
            const destino = `/gamescreen?code=${codigoSala.toUpperCase()}`;
            console.log("[Loading] A redirecionar para:", destino);
            window.location.href = destino;
        } else {
            console.error("[Loading] Erro: Código de sala em falta!");
            alert("Erro ao carregar os dados da partida.");
            window.location.href = "/hub";
        }
    }, 3000); 
});