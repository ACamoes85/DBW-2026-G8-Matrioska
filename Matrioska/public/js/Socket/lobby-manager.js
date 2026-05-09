"use strict";

// Importamos as funções do serviço de socket e os elementos 
import { joinRoom, listenForPlayers } from "./socket-service.js";
import { roomCodeDisplay } from "./elements.js";

console.log("Lobby Manager carregado!");

document.addEventListener("DOMContentLoaded", () => {
    // Ir buscar o código da sala que está no HTML
    const codigoSala = roomCodeDisplay?.innerText.trim();

    // Capturar os teus dados usando os campos hidden do lobby.ejs
    const userId = document.getElementById("current-user-id")?.value;
    const username = document.getElementById("player-username-display")?.innerText;
    
    const meuSlot = document.getElementById(`player-${userId}`);
    const minhaImagem = meuSlot ? meuSlot.querySelector("img") : null;
    const avatar = minhaImagem ? minhaImagem.src : '/images/profile1.png';

    // Criamos o objeto com os dados exatos para enviar ao servidor
    const dadosUtilizador = {
        id: userId,
        username: username,
        avatar: avatar
    };

    // Entrar na sala via Socket e começar a ouvir entradas/saídas
    if (codigoSala && codigoSala !== "------" && userId) {
        console.log(`Ligando ao socket como: ${username} (ID: ${userId})`);
        
        // Faz o "join" na sala enviando o código e os teus dados reais
        joinRoom(codigoSala, dadosUtilizador);

        // Ativa os ouvintes para ver outros jogadores a entrar ou sair
        listenForPlayers();
    } else {
        console.error("Erro: Não foi possível recuperar os dados do utilizador para o Socket.");
    }
});