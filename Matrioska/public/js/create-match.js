"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const roomCodeDisplay = document.getElementById("room-code");
  const hiddenInput = document.getElementById("hidden-room-code");
  const btnConfirm = document.getElementById("btn-confirm-create");
  const hiddenLanguage = document.getElementById("hidden-game-language");

  /**
   * Função para gerar um código aleatório de 6 caracteres
   */
  function generateRoomCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  if (hiddenLanguage) {
    const idiomaAtual = localStorage.getItem("idioma") || "pt";
    hiddenLanguage.value = idiomaAtual === "en" ? "en" : "pt";
  }

  // Gerar o código assim que a página carrega
  const newCode = generateRoomCode();

  // Mostrar no ecrã para o utilizador ver
  if (roomCodeDisplay) {
    roomCodeDisplay.innerText = newCode;
  }

  // Colocar no input hidden para ser enviado no POST ao servidor
  if (hiddenInput) {
    hiddenInput.value = newCode;
  }

  // Validação extra ao clicar no botão
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      if (!hiddenInput.value || hiddenInput.value === "------") {
        e.preventDefault();
        alert("Erro ao gerar código da sala. Por favor, recarregue a página.");
      }
    });
  }
});
