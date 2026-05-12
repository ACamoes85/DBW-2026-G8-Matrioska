"use strict";

function mostrarAviso(mensagem) {
    const el = document.getElementById("hub-aviso");
    if (!el) return;
    el.innerText = mensagem;
    el.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {

    // Aviso vindo do socket (líder saiu do lobby ou do jogo)
    const aviso = localStorage.getItem("aviso-hub");
    if (aviso) {
        mostrarAviso(aviso);
        localStorage.removeItem("aviso-hub");
    }

    // Erros vindos do URL (sala cheia, não encontrada, etc.)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
        const t = (chave, fallback) => window.texto ? window.texto(chave) : fallback;

        const mensagens = {
            solo_room: t("errorSoloRoom", "Esta sala é privada (Modo Solo) e não permite outros jogadores."),
            full:      t("errorFull", "Esta sala já está cheia (limite de 4 jogadores)."),
            notfound:  t("errorNotFound", "Não foi encontrada nenhuma sala com esse código."),
            private:   t("errorPrivate", "Esta partida já não está disponível."),
            started:   t("errorStarted", "Esta partida já foi iniciada."),
        };

        mostrarAviso(mensagens[error] || t("errorGeneric", "Ocorreu um erro ao tentar entrar na sala."));
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Validação do formulário de entrada
    const joinForm = document.getElementById("join-room-form");
    if (joinForm) {
        joinForm.addEventListener("submit", (e) => {
            const input = document.getElementById("room-code-input");
            if (input && input.value.length < 5) {
                e.preventDefault();
                mostrarAviso("O código da sala deve ter pelo menos 5 caracteres.");
            }
        });
    }
});