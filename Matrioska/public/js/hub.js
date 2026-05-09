"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // CAPTURAR ERROS DO URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
        let mensagem = "";

        switch (error) {
            case 'solo_room':
                mensagem = "Esta sala é privada (Modo Solo) e não permite outros jogadores.";
                break;
            case 'full':
                mensagem = "Esta sala já está cheia (limite de 4 jogadores).";
                break;
            case 'notfound':
                mensagem = "Não foi encontrada nenhuma sala com esse código.";
                break;
            case 'private':
                mensagem = "Esta partida já não está disponível.";
                break;
            default:
                mensagem = "Ocorreu um erro ao tentar entrar na sala.";
        }

        // Exibe o alerta
        alert(mensagem);

        // Limpa o erro do URL para não repetir o alerta ao fazer refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // LÓGICA DO FORMULÁRIO DE ENTRADA (Opcional, se tiveres o campo de código)
    const joinForm = document.getElementById("join-room-form");
    if (joinForm) {
        joinForm.addEventListener("submit", (e) => {
            const input = document.getElementById("room-code-input");
            if (input && input.value.length < 5) {
                e.preventDefault();
                alert("O código da sala deve ter pelo menos 5 caracteres.");
            }
        });
    }
});