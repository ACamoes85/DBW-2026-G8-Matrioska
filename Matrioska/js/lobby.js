document.addEventListener("DOMContentLoaded", () => {
  carregarDadosLobby();
  configurarBotaoIniciar();
});

/* Carrega no lobby os dados guardados anteriormente */
function carregarDadosLobby() {
  const codigoSala = localStorage.getItem("codigoSalaAtual");
  const modoJogo = localStorage.getItem("modoJogo");
  const tempoLimite = localStorage.getItem("tempoLimite");
  const username = localStorage.getItem("user");

  const displayLobby = document.querySelector(".lobby-code .code-display");
  const displayUsername = document.getElementById("player-username-display");

  /* Mostra o código da sala */
  if (displayLobby && codigoSala) {
    displayLobby.innerText = codigoSala;
  }

  /* Mostra o nome do jogador */
  if (displayUsername && username) {
    displayUsername.innerText = username;
  }

  /* Apenas para verificação no console */
  console.log("Código da sala:", codigoSala);
  console.log("Modo de jogo:", modoJogo);
  console.log("Tempo limite:", tempoLimite);
  console.log("Jogador:", username);
}

/* Configura o botão de iniciar partida */
function configurarBotaoIniciar() {
  const btnIniciar = document.getElementById("btn-start-match");

  if (!btnIniciar) return;

  btnIniciar.addEventListener("click", () => {
    const modoJogo = localStorage.getItem("modoJogo");
    const tempoLimite = localStorage.getItem("tempoLimite");
    const codigoSala = localStorage.getItem("codigoSalaAtual");

    /* Guarda o estado da partida atual */
    const partidaAtual = {
      modo: modoJogo,
      tempo: tempoLimite,
      codigo: codigoSala
    };

    localStorage.setItem("partidaAtual", JSON.stringify(partidaAtual));

    console.log("Partida iniciada:", partidaAtual);

    /* Redireciona para a página de jogo */
    window.location.href = "gamescreen.html";
  });
}