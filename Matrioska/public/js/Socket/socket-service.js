"use strict";

const socket = io();
window.socketLobby = socket;

const t = (chave, fallback) => {
    return window.texto ? window.texto(chave) : fallback;
};

export function joinRoom(roomCode, user) {
    if (roomCode && user) {
        const userId = user.id || user._id;
        socket.emit("join-room", { roomCode, user: { ...user, id: userId } });
    }
}

export function listenForPlayers(callbackIniciar) {

    // LÍDER SAIU DO LOBBY — redireciona todos para o hub com aviso
    socket.on("lider-saiu-lobby", () => {
        localStorage.setItem("aviso-hub", t("leaderLeftLobby", "O líder saiu do lobby. A sala foi encerrada."));
        window.location.href = "/hub";
    });

    // QUANDO ALGUÉM SAI
    socket.on("player-left", (userId) => {
        const idRemover = String(userId).trim();
        const elementoParaRemover = document.getElementById(`player-${idRemover}`);
        if (elementoParaRemover) elementoParaRemover.remove();
    });

    // NOVO LÍDER — emitido pelo servidor quando o líder sai (qualquer estado da sala)
    socket.on("novo-lider", ({ novoLiderId, jogadores, modoJogo }) => {
        const meuId = String(document.getElementById("current-user-id")?.value || "").trim();
        const souONovoLider = meuId === String(novoLiderId).trim();

        // Atualiza o botão no lobby
        const actionsContainer = document.querySelector(".actions-section");
        if (actionsContainer) {
            if (souONovoLider) {
                actionsContainer.innerHTML = `
                    <button class="btn-create-match" id="btn-start-match">
                        ${t("startMatchBtn", "Iniciar partida")}
                    </button>
                `;
                const novoBtn = document.getElementById("btn-start-match");
                if (novoBtn && callbackIniciar) {
                    novoBtn.onclick = callbackIniciar;
                }
                // Atualiza o estado do botão conforme o número de jogadores
                if (typeof atualizarEstadoBotao === "function") {
                    atualizarEstadoBotao(jogadores, modoJogo);
                }
            } else {
                // Garante que não-líderes veem a mensagem de espera
                if (!document.querySelector(".waiting-msg")) {
                    actionsContainer.innerHTML = `
                        <p id="waiting-leader-msg" class="waiting-msg" style="color: white; font-style: italic; opacity: 0.8;">
                            ${t("waitingLeaderMsg", "A aguardar que o líder inicie a partida...")}
                        </p>
                    `;
                }
            }
        }
    });

    // REDIRECIONAMENTO PARA O JOGO
    socket.on("navigate-to-game", (roomCode) => {
        const limpo = String(roomCode).trim().toUpperCase();
        window.location.href = `/loadingmatch?code=${limpo}`;
    });
}