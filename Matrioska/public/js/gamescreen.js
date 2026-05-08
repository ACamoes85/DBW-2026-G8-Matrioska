document.addEventListener("DOMContentLoaded", () => {
  inicializarJogo();
  configurarSubmissaoPalavras();
  iniciarTemporizador();
});

const bancoPalavras = {
  RELACAO: ["RELA", "REAL", "LEAL", "LAR", "ALA", "CAL", "RA", "AR", "AO"],
  PASSAGEIRO: ["PASSA", "ASA", "AGE", "EIRO", "RIO", "SAI", "PAI"],
  SOLIDARIEDADE: ["SOL", "LIDA", "IDA", "IDADE", "AR", "RIO", "DIA"],
  COMPUTADOR: ["COM", "PUTA", "DOR", "DADO", "TOR", "ADOR", "RATO"],
  PROGRAMACAO: ["PRO", "GRAMA", "AMA", "RAMA", "ACAO", "ROCA", "AR"],
  DESENVOLVIMENTO: ["ENVIO", "VENTO", "DENTE", "SOM", "LENTO", "VIVO", "MENTE"]
};

let palavraMestreAtual = "";
let palavrasValidasAtuais = [];
let palavrasEncontradas = [];
let pontuacao = 0;
let tempoRestante = 30;
let intervaloTemporizador = null;

function inicializarJogo() {
  const partidaAtual = JSON.parse(localStorage.getItem("partidaAtual"));
  const idiomaAtual = localStorage.getItem("idioma") || "pt";
  // Fallback caso traducoes não esteja definido globalmente
  const dados = (typeof traducoes !== 'undefined') ? traducoes[idiomaAtual] : { scorePrefix: "Pontos:", noMatchFound: "Partida não encontrada!" };

  const elTimer = document.getElementById("game-timer");
  const elRoomCode = document.getElementById("game-room-code");
  const elMasterWord = document.getElementById("master-word");
  const elMode = document.getElementById("game-mode-display");
  const elScore = document.getElementById("score-display");

  if (!partidaAtual) {
    alert(dados.noMatchFound);
    window.location.href = "/create-match";
    return;
  }

  tempoRestante = parseInt(partidaAtual.tempo, 10) || 30;
  if (elTimer) elTimer.innerText = `${tempoRestante}s`;
  if (elRoomCode && partidaAtual.codigo) elRoomCode.innerText = partidaAtual.codigo;

  if (elMode && partidaAtual.modo) {
    const prefix = dados.gameModePrefix || "Modo:";
    const modo = partidaAtual.modo === "multiplayer" ? (dados.gameModeMultiplayer || "Multijogador") : (dados.gameModeSolo || "Solo");
    elMode.innerText = `${prefix} ${modo}`;
  }

  escolherPalavraMestre();
  if (elMasterWord) elMasterWord.innerText = palavraMestreAtual;
  if (elScore) elScore.innerText = `${dados.scorePrefix} ${pontuacao}`;
}

function escolherPalavraMestre() {
  const palavrasMestre = Object.keys(bancoPalavras);
  palavraMestreAtual = palavrasMestre[Math.floor(Math.random() * palavrasMestre.length)];
  palavrasValidasAtuais = bancoPalavras[palavraMestreAtual];
}

function iniciarTemporizador() {
  const elTimer = document.getElementById("game-timer");
  const idiomaAtual = localStorage.getItem("idioma") || "pt";
  const dados = (typeof traducoes !== 'undefined') ? traducoes[idiomaAtual] : { timeUpAlert: "Tempo esgotado!" };

  if (!elTimer) return;

  intervaloTemporizador = setInterval(() => {
    tempoRestante--;
    elTimer.innerText = `${tempoRestante}s`;

    if (tempoRestante <= 0) {
      clearInterval(intervaloTemporizador);
      const resultadoPartida = {
        palavraMestre: palavraMestreAtual,
        palavrasEncontradas,
        pontuacao,
        tempo: 0
      };
      localStorage.setItem("resultadoPartida", JSON.stringify(resultadoPartida));
      alert(dados.timeUpAlert);
      window.location.href = "/scoreboard";
    }
  }, 1000);
}

function configurarSubmissaoPalavras() {
  const input = document.getElementById("player-word");
  const button = document.getElementById("submit-word-btn");
  if (button) button.addEventListener("click", submeterPalavra);
  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submeterPalavra();
      }
    });
  }
}

function submeterPalavra() {
  const input = document.getElementById("player-word");
  const feedback = document.getElementById("feedback-message");
  const lista = document.getElementById("found-words-list");
  const score = document.getElementById("score-display");
  const idiomaAtual = localStorage.getItem("idioma") || "pt";
  const dados = (typeof traducoes !== 'undefined') ? traducoes[idiomaAtual] : { scorePrefix: "Pontos:" };

  if (!input || !feedback || !lista || !score) return;

  const palavra = input.value.trim().toUpperCase();
  if (!palavra) return;

  if (palavra.length < 2 || palavrasEncontradas.includes(palavra) || palavra === palavraMestreAtual) {
    input.value = "";
    return;
  }

  const existeNaLista = palavrasValidasAtuais.includes(palavra);
  const respeitaSequencia = ehSubsequencia(palavra, palavraMestreAtual);

  if (existeNaLista && respeitaSequencia) {
    palavrasEncontradas.push(palavra);
    const pontosGanhos = palavra.length * 10;
    pontuacao += pontosGanhos;

    const item = document.createElement("li");
    item.innerText = `${palavra} (+${pontosGanhos})`;
    lista.appendChild(item);

    score.innerText = `${dados.scorePrefix} ${pontuacao}`;
  }

  input.value = "";
  input.focus();
}

function ehSubsequencia(palavraPequena, palavraGrande) {
  let i = 0, j = 0;
  while (i < palavraPequena.length && j < palavraGrande.length) {
    if (palavraPequena[i] === palavraGrande[j]) i++;
    j++;
  }
  return i === palavraPequena.length;
}