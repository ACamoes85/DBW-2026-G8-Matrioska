document.addEventListener("DOMContentLoaded", () => {
  inicializarJogo();
  configurarSubmissaoPalavras();
  iniciarTemporizador();
});

/* Banco local de palavras para testes do frontend.
   Cada palavra-mestra tem um conjunto de subpalavras válidas. */
const bancoPalavras = {
  RELACAO: ["RELA", "REAL", "LEAL", "LAR", "ALA", "CAL", "RA", "AR", "AO"],
  PASSAGEIRO: ["PASSA", "ASA", "AGE", "EIRO", "RIO", "SAI", "PAI"],
  SOLIDARIEDADE: ["SOL", "LIDA", "IDA", "IDADE", "AR", "RIO", "DIA"],
  COMPUTADOR: ["COM", "PUTA", "DOR", "DADO", "TOR", "ADOR", "RATO"],
  PROGRAMACAO: ["PRO", "GRAMA", "AMA", "RAMA", "ACAO", "ROCA", "AR"],
  DESENVOLVIMENTO: ["ENVIO", "VENTO", "DENTE", "SOM", "LENTO", "VIVO", "MENTE"]
};

/* Estado atual do jogo */
let palavraMestreAtual = "";
let palavrasValidasAtuais = [];
let palavrasEncontradas = [];
let pontuacao = 0;
let tempoRestante = 30;
let intervaloTemporizador = null;

/* Inicializa a página de jogo com os dados vindos do lobby */
function inicializarJogo() {
  const partidaAtual = JSON.parse(localStorage.getItem("partidaAtual"));
  const idiomaAtual = localStorage.getItem("idioma") || "pt";
  const dados = traducoes[idiomaAtual];

  const elTimer = document.getElementById("game-timer");
  const elRoomCode = document.getElementById("game-room-code");
  const elMasterWord = document.getElementById("master-word");
  const elMode = document.getElementById("game-mode-display");
  const elScore = document.getElementById("score-display");

  if (!partidaAtual) {
  alert(dados.noMatchFound);
  window.location.href = "create-match.html";
  return;
  }

  /* Tempo */
  tempoRestante = parseInt(partidaAtual.tempo, 10) || 30;
  if (elTimer) {
    elTimer.innerText = `${tempoRestante}s`;
  }

  /* Código da sala */
  if (elRoomCode && partidaAtual.codigo) {
    elRoomCode.innerText = partidaAtual.codigo;
  }

  /* Mostrar modo de jogo */
  if (elMode && partidaAtual.modo) {
  const modoTexto =
    partidaAtual.modo === "multiplayer"
      ? `${dados.gameModePrefix} ${dados.gameModeMultiplayer}`
      : `${dados.gameModePrefix} ${dados.gameModeSolo}`;

  elMode.innerText = modoTexto;
}

  /* Escolher palavra-mestra */
  escolherPalavraMestre();

  if (elMasterWord) {
    elMasterWord.innerText = palavraMestreAtual;
  }

  /* Pontuação inicial */
  if (elScore) {
  elScore.innerText = `${dados.scorePrefix} ${pontuacao}`;
}

  /* Guardar palavra atual */
  localStorage.setItem("palavraAtual", palavraMestreAtual);
}

/* Escolhe aleatoriamente uma palavra-mestra do banco */
function escolherPalavraMestre() {
  const palavrasMestre = Object.keys(bancoPalavras);
  palavraMestreAtual =
    palavrasMestre[Math.floor(Math.random() * palavrasMestre.length)];

  palavrasValidasAtuais = bancoPalavras[palavraMestreAtual];
}

/* Inicia o temporizador */
function iniciarTemporizador() {
  const elTimer = document.getElementById("game-timer");
  const idiomaAtual = localStorage.getItem("idioma") || "pt";
  const dados = traducoes[idiomaAtual];

  if (!elTimer) return;

  intervaloTemporizador = setInterval(() => {
    tempoRestante--;
    elTimer.innerText = `${tempoRestante}s`;

    if (tempoRestante <= 0) {
      clearInterval(intervaloTemporizador);

      /* Guardar resultados da partida */
      const resultadoPartida = {
        palavraMestre: palavraMestreAtual,
        palavrasEncontradas,
        pontuacao,
        tempo: 0
      };

      localStorage.setItem("resultadoPartida", JSON.stringify(resultadoPartida));

      alert(dados.timeUpAlert);
      window.location.href = "scoreboard.html";
    }
  }, 1000);
}

/* Configura submissão por botão e Enter */
function configurarSubmissaoPalavras() {
  const idiomaAtual = localStorage.getItem("idioma") || "pt";
  const dados = traducoes[idiomaAtual];
  const input = document.getElementById("player-word");
  const button = document.getElementById("submit-word-btn");

  if (button) {
    button.addEventListener("click", submeterPalavra);
  }

  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submeterPalavra();
      }
    });
  }
}

/* Lê, valida e regista a palavra submetida */
function submeterPalavra() {
  const input = document.getElementById("player-word");
  const feedback = document.getElementById("feedback-message");
  const lista = document.getElementById("found-words-list");
  const score = document.getElementById("score-display");

  if (!input || !feedback || !lista || !score) return;

  const palavra = input.value.trim().toUpperCase();

  if (!palavra) {
    feedback.innerText = dados.emptyWordFeedback;
    return;
  }

  if (palavra.length < 2) {
    feedback.innerText = dados.shortWordFeedback;
    input.value = "";
    return;
  }

  if (palavrasEncontradas.includes(palavra)) {
    feedback.innerText = dados.repeatedWordFeedback;
    input.value = "";
    return;
  }

  if (palavra === palavraMestreAtual) {
    feedback.innerText = dados.masterWordFeedback;
    input.value = "";
    return;
  }

  /* Validação principal:
     1. Está na lista válida
     2. Respeita a regra de subsequência */
  const existeNaLista = palavrasValidasAtuais.includes(palavra);
  const respeitaSequencia = ehSubsequencia(palavra, palavraMestreAtual);

  if (existeNaLista && respeitaSequencia) {
    palavrasEncontradas.push(palavra);

    const pontosGanhos = calcularPontuacao(palavra);
    pontuacao += pontosGanhos;

    const item = document.createElement("li");
    item.innerText = `${palavra} (+${pontosGanhos})`;
    lista.appendChild(item);

    score.innerText = `${dados.scorePrefix} ${pontuacao}`;
    feedback.innerText = dados.validWordFeedback;
  } else {
    feedback.innerText = dados.invalidWordFeedback;
  }

  input.value = "";
  input.focus();
}

/* Verifica se a palavra pequena aparece como subsequência na palavra-mestra
   Exemplo: ALA em RELACAO -> válido */
function ehSubsequencia(palavraPequena, palavraGrande) {
  let i = 0;
  let j = 0;

  while (i < palavraPequena.length && j < palavraGrande.length) {
    if (palavraPequena[i] === palavraGrande[j]) {
      i++;
    }
    j++;
  }

  return i === palavraPequena.length;
}

/* Pontuação simples com base no tamanho da palavra */
function calcularPontuacao(palavra) {
  return palavra.length * 10;
}