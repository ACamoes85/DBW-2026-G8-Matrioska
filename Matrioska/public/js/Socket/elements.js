"use strict";

/**
 * Exporta os elementos do DOM utilizados na lógica do Lobby e Socket
 */

// Onde o código da sala é exibido (ex: <div id="room-code">)
export const roomCodeDisplay = document.getElementById("room-code");

// O contentor principal onde os avatares dos jogadores são inseridos
export const playersList = document.querySelector(".players-list");

// O botão de iniciar partida
export const btnStartMatch = document.getElementById("btn-start-match");

// O contentor que alterna entre o botão e a mensagem de espera
export const actionsContainer = document.querySelector(".actions-section");