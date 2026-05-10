"use strict";

import { joinRoom, listenForPlayers } from "./socket-service.js";
import { atualizarEstadoBotao } from "../lobby.js"; 

document.addEventListener("DOMContentLoaded", () => {
    const roomCodeElement = document.getElementById("room-code");
    const userIdElement = document.getElementById("current-user-id");
    const btnStart = document.getElementById("btn-start-match");

    if (roomCodeElement && userIdElement) {
        const roomCode = roomCodeElement.innerText.trim();
        
        const iniciarAcao = async () => {
            try {
                const response = await fetch("/api/match/start", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ codigoSala: roomCode })
                });

                if (response.ok) {
                    if (window.socketLobby) {
                        window.socketLobby.emit("start-game-request", roomCode);
                    }
                } else {
                    const data = await response.json();
                    alert(data.erro || "Erro ao iniciar jogo.");
                }
            } catch (err) {
                console.error("[Manager] Erro:", err);
            }
        };

        const user = {
            id: userIdElement.value,
            username: document.getElementById("player-username-display")?.innerText || "Jogador"
        };

        joinRoom(roomCode, user);
        listenForPlayers(iniciarAcao);

        // --- ESCUTAR ATUALIZAÇÃO DA SALA ---
        if (window.socketLobby) {
            window.socketLobby.on("room-update", (data) => {
                console.log("[Manager] Dados da sala atualizados:", data);
                
                // Atualizar o Botão
                atualizarEstadoBotao(data.jogadores, data.modoJogo);

                // ATUALIZAR A LISTA VISUAL DE JOGADORES
                const listaContainer = document.querySelector(".players-list");
                if (listaContainer) {
                    listaContainer.innerHTML = ""; // Limpa a lista atual

                    data.jogadores.forEach(jogador => {
                        const idJogador = String(jogador.id || jogador._id);
                        
                        const playerSlot = document.createElement("div");
                        playerSlot.className = "player-slot";
                        playerSlot.id = `player-${idJogador}`;

                        playerSlot.innerHTML = `
                            <div class="avatar-container">
                                <img src="${jogador.avatar}" alt="Jogador">
                                <div class="avatar-glow"></div>
                            </div>
                            <div class="player-name-badge">
                                <span>${jogador.username}</span>
                            </div>
                        `;
                        listaContainer.appendChild(playerSlot);
                    });
                }
            });
        }

        if (btnStart) {
            btnStart.onclick = iniciarAcao;
        }
    }
});