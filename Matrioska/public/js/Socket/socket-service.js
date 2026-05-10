"use strict";

// Inicializa a conexão Socket.io
const socket = io();

// Disponibiliza o socket globalmente para o lobby-manager e outros scripts
window.socketLobby = socket;

/**
 * Envia o sinal para entrar na sala
 */
export function joinRoom(roomCode, user) {
    if (roomCode && user) {
        // Garantimos que enviamos o ID de forma consistente (id ou _id)
        const userId = user.id || user._id;
        console.log(`[Socket] A emitir join-room para a sala: ${roomCode} com user: ${userId}`);
        socket.emit("join-room", { roomCode, user: { ...user, id: userId } });
    }
}

/**
 * Escuta os eventos do servidor para gerir a navegação e saída
 */
export function listenForPlayers(callbackIniciar) {
    
    // QUANDO ALGUÉM SAI
    socket.on("player-left", (userId) => {
        const idRemover = String(userId).trim();
        console.log(`[Socket] Jogador saiu: ${idRemover}`);

        // Remover o elemento visual do jogador que saiu
        const elementoParaRemover = document.getElementById(`player-${idRemover}`);
        if (elementoParaRemover) elementoParaRemover.remove();

        // Lógica de promoção de líder
        const todosOsSlots = document.querySelectorAll('.player-slot');
        const meuIdInput = document.getElementById("current-user-id");
        
        if (meuIdInput && todosOsSlots.length > 0) {
            const meuId = String(meuIdInput.value).trim();
            const primeiroJogadorId = todosOsSlots[0].id.replace('player-', ''); 

            if (primeiroJogadorId === meuId) {
                const actionsContainer = document.querySelector('.actions-section');
                
                // Se eu sou o novo primeiro da lista e o botão ainda não existe, eu crio-o
                if (actionsContainer && !document.getElementById('btn-start-match')) {
                    console.log("[Socket] Promoção: Agora és o líder da sala.");
                    
                    actionsContainer.innerHTML = `
                        <button class="btn-create-match" id="btn-start-match">
                            Iniciar partida
                        </button>
                    `;
                    
                    const novoBtn = document.getElementById('btn-start-match');
                    if (novoBtn && callbackIniciar) {
                        novoBtn.onclick = callbackIniciar;
                    }
                }
            }
        }
    });

    // ESCUTAR REDIRECIONAMENTO PARA O JOGO 
    socket.on("navigate-to-game", (roomCode) => {
        const limpo = String(roomCode).trim().toUpperCase();
        console.log(`[Socket] A iniciar transição para a sala ${limpo}`);
        // Redireciona para o loading antes do gamescreen
        window.location.href = `/loadingmatch?code=${limpo}`;
    });
}