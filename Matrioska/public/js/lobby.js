"use strict";
const t = (chave, fallback) => {
  return window.texto ? window.texto(chave) : fallback;
};
/**
 * Atualiza o estado visual do botão de início
 */
export function atualizarEstadoBotao(jogadores, modoJogo) {
  const btnIniciar = document.getElementById("btn-start-match");
  // Se o botão não existe (ex: o jogador não é o líder), não faz nada
  if (!btnIniciar) return;

  if (modoJogo === "multiplayer" && jogadores.length < 2) {
    btnIniciar.disabled = true;
    btnIniciar.style.opacity = "0.5";
    btnIniciar.style.cursor = "not-allowed";
    btnIniciar.innerText = t(
      "waitingPlayersBtn",
      "A aguardar jogadores (mín. 2)...",
    );
  } else {
    btnIniciar.disabled = false;
    btnIniciar.style.opacity = "1";
    btnIniciar.style.cursor = "pointer";
    btnIniciar.innerText = t("startMatchBtn", "Iniciar partida");
  }
}

/**
 * Vincula o evento de clique ao botão de iniciar.
 */
export function vincularBotaoIniciar(callback) {
  const btnIniciar = document.getElementById("btn-start-match");
  if (btnIniciar) {
    btnIniciar.onclick = (e) => {
      if (btnIniciar.disabled) return;
      callback(e);
    };
  }
}
