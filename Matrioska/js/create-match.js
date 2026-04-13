document.addEventListener("DOMContentLoaded", () => { 
    gerarCodigoSala();
    configurarBotaoCriar();
});

// Gera um código aleatório de 6 caracteres e exibe no ecrã
function gerarCodigoSala() {
    const elRoomCode = document.getElementById("room-code");
    if (elRoomCode) {
        const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let resultado = "";
        for (let i = 0; i < 6; i++) {
            resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        elRoomCode.innerText = resultado;
    }
}

// Guarda as definições da partida e o código no localStorage
function configurarBotaoCriar() {
    const btnCriar = document.getElementById("btn-confirm-create");
    const displayCodigo = document.getElementById("room-code");
    const selectModo = document.getElementById("game-mode");
    const selectTempo = document.getElementById("time-limit");

    if (btnCriar && displayCodigo) {
        btnCriar.addEventListener("click", () => {
            // Guarda o código gerado
            localStorage.setItem("codigoSalaAtual", displayCodigo.innerText);
            
            // Guarda também as definições de jogo
            if (selectModo) localStorage.setItem("modoJogo", selectModo.value);
            if (selectTempo) localStorage.setItem("tempoLimite", selectTempo.value);

            // Redireciona para o lobby
            window.location.href = "lobby.html"; 
        });
    }
}