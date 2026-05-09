"use strict";

import { playersList } from "./elements.js";

const socket = io();

/**
 * Envia o sinal para entrar na sala
 */
export function joinRoom(roomCode, user) {
    if (roomCode && user) {
        socket.emit("join-room", { roomCode, user });
    }
}

/**
 * Escuta eventos do servidor
 */
export function listenForPlayers() {
    
    // QUANDO OUTRO JOGADOR ENTRA
    socket.on("player-joined", (novoJogador) => {
        if (!document.getElementById(`player-${novoJogador.id}`)) {
            const html = `
                <div class="player-slot" id="player-${novoJogador.id}">
                    <div class="avatar-container">
                        <img src="${novoJogador.avatar}" alt="Jogador">
                        <div class="avatar-glow"></div>
                    </div>
                    <div class="player-name-badge">
                        <span>${novoJogador.username}</span>
                    </div>
                </div>
            `;
            
            const lista = playersList || document.querySelector(".players-list");
            if (lista) {
                lista.insertAdjacentHTML('beforeend', html);
            }
        }
    });

    // QUANDO ALGUÉM SAI
    socket.on("player-left", (userId) => {
        const elementoParaRemover = document.getElementById(`player-${userId}`);
        
        if (elementoParaRemover) {
            elementoParaRemover.remove();
            console.log(`Jogador ${userId} saiu.`);
        }

        // VERIFICAÇÃO DE NOVO LÍDER:
        // O líder é sempre o primeiro elemento na lista de jogadores do HTML
        const todosOsSlots = document.querySelectorAll('.player-slot');
        const meuId = document.getElementById("current-user-id")?.value;

        if (todosOsSlots.length > 0) {
            const primeiroJogadorId = todosOsSlots[0].id; // Ex: "player-123"

            // Se o primeiro boneco agora for o MEU
            if (primeiroJogadorId === `player-${meuId}`) {
                const actionsContainer = document.querySelector('.actions-section');
                
                // Se o botão ainda não existir no meu ecrã, eu crio-o
                if (actionsContainer && !document.getElementById('btn-start-match')) {
                    actionsContainer.innerHTML = `
                        <button class="btn-create-match" id="btn-start-match">
                            Iniciar partida
                        </button>
                    `;
                    console.log("Agora és o líder da sala! Botão ativado.");
                }
            }
        }
    });
}