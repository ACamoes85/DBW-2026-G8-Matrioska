/* Dicionário de textos para multi-idioma */
const traducoes = {
    pt: {
        /* Homepage / comum */
        welcome: "Bem-vindo à Matrioska",
        description: "Revela o máximo de palavras antes que o tempo se esgote.",
        login: "Entrar",
        register: "Registar",

        /* Login */
        loginSubtitle: "Insere os teus dados",
        email: "E-mail",
        username: "Nome de utilizador",
        password: "Palavra-passe",
        loginButton: "Entrar",

        /* Register */
        registerSubtitle: "Insere os teus dados",
        confirmPassword: "Confirmar palavra-passe",
        registerButton: "Registar",

        /* Hub */
        navHome: "Início",
        navRanking: "Classificação",
        navHow: "Como jogar",
        createGame: "Criar partida",
        enterRoom: "Introduzir código da sala",
        enter: "Entrar",

        /* How to Play */
        back: "Voltar",
        rulesTitle: "Como jogar",
        rule1: "Palavra-Mestra:",
        rule1Desc: "No teu ecrã irá aparecer uma \"Palavra-Mestra\".",
        rule2: "Palavras escondidas:",
        rule2Desc: "O teu objetivo é encontrar palavras menores \"escondidas\" dentro dela, antes que o tempo acabe.",
        rule3: "Regra:",
        rule3Desc: "As letras podem estar em sequência direta ou indireta.",
        rule4: "Pontuação:",
        rule4Desc: "Quanto maior a palavra, mais pontos irá obter.",
        rule5: "Aqui está um exemplo prático:",
        correctAnswers: "Respostas corretas:",
        exampleWord: "Passageiro",
        exampleAnswers: ["PASSA", "ASA", "SAGE", "AGE", "EIRO"],

        /* Leaderboard */
        leaderboardTitle: "Classificação",
        colPos: "Posição",
        colPlayer: "Jogador",
        colScore: "Pontuação Total",

        /* Barra de Navegação */
        navStart: "Início",
        navLeaderboard: "Classificação",
        navHowTo: "Como jogar",

        /* Profile */
        changePhoto: "Alterar imagem de perfil",
        statsTitle: "Estatísticas",
        statTotalScore: "Pontuação Total",
        statCorrect: "Respostas Corretas",
        statWrong: "Respostas Erradas",
        statGames: "Partidas Jogadas",

        /* Edit Profile*/
        editAvatarTitle: "Imagem de perfil",
        chooseImage: "Escolha uma imagem:",

        /* Create Match */
        createMatchTitle: "Criar partida",
        gameModeLabel: "Modo de Jogo:",
        multiplayer: "Multijogador",
        solo: "Solo",
        timeLimitLabel: "Tempo Limite:",
        roomCodeLabel: "Código da Sala:",
        createBtn: "Criar",
 
        /* Lobby */
        lobbyTitle: "Sala de Jogo",
        startMatchBtn: "Iniciar partida",
        lobbyRoomCodeLabel: "Código da sala:",

        /* Game Screen */
        gameScreenTitle: "Sala de Jogo",
        masterWordLabel: "A palavra é:",
        foundWordsTitle: "Palavras encontradas:",
        gameRoomCodeLabel: "Código da sala:",
        submitWordBtn: "Submeter",
        gameModePrefix: "Modo:",
        gameModeSolo: "Solo",
        gameModeMultiplayer: "Multijogador",
        scorePrefix: "Pontuação:",
        emptyWordFeedback: "Escreve uma palavra antes de submeter.",
        shortWordFeedback: "A palavra é demasiado curta.",
        repeatedWordFeedback: "Essa palavra já foi encontrada.",
        masterWordFeedback: "Não podes submeter a palavra-mestra completa.",
        validWordFeedback: "Palavra válida!",
        invalidWordFeedback: "Palavra inválida para esta ronda.",
        noMatchFound: "Nenhuma partida encontrada!",
        timeUpAlert: "Tempo esgotado!",
        wordInputPlaceholder: "Escreve uma palavra...",

        /* Botão de troca de idioma */
        nextLang: "English",
        flag: "/images/english_icon.png",
    },

    en: {
        /* Homepage / comum */
        welcome: "Welcome to Matrioska",
        description: "Reveal as many words as possible before time runs out.",
        login: "Login",
        register: "Register",

        /* Login */
        loginSubtitle: "Enter your details",
        email: "E-mail",
        username: "Username",
        password: "Password",
        loginButton: "Login",

        /* Register */
        registerSubtitle: "Enter your details",
        confirmPassword: "Confirm password",
        registerButton: "Register",

        /* Hub */
        navHome: "Home",
        navRanking: "Leaderboard",
        navHow: "How to play",
        createGame: "Create game",
        enterRoom: "Enter room code",
        enter: "Enter",

        /* How to Play */
        back: "Back",
        rulesTitle: "How to Play",
        rule1: "Master Word:",
        rule1Desc: "A \"Master Word\" will appear on your screen.",
        rule2: "Hidden words:",
        rule2Desc: "Your goal is to find and type the smaller words \"hidden\" within it before the time runs out.",
        rule3: "The Rule:",
        rule3Desc: "Letters can be in a direct or indirect sequence.",
        rule4: "Scoring:",
        rule4Desc: "The more words you find or the longer they are, the more points you earn!",
        rule5: "Here's a practical example:",
        correctAnswers: "Correct answers:",
        exampleWord: "Overstanding",
        exampleAnswers: ["OVER", "STAND", "STANDING", "STAIN", "AND"],

        /* Leaderboard */
        leaderboardTitle: "Leaderboard",
        colPos: "Rank",
        colPlayer: "Player",
        colScore: "Total Score",

        /* Barra de Navegação */
        navStart: "Home",
        navLeaderboard: "Leaderboard",
        navHowTo: "How to Play",

        /* Profile */
        changePhoto: "Change profile picture",
        statsTitle: "Stats",
        statTotalScore: "Total Score",
        statCorrect: "Correct Answers",
        statWrong: "Wrong Answers",
        statGames: "Matches Played",

        /* Edit Profile*/
        editAvatarTitle: "Profile picture",
        chooseImage: "Choose a picture:",

        /* Create Match */
        createMatchTitle: "Create Match",
        gameModeLabel: "Game Mode:",
        multiplayer: "Multiplayer",
        solo: "Solo",
        timeLimitLabel: "Time Limit:",
        roomCodeLabel: "Room Code:",
        createBtn: "Create",

        /* Lobby */
        lobbyTitle: "Game Room",
        startMatchBtn: "Start Match",
        lobbyRoomCodeLabel: "Room code:",

        /* Game Screen */
        gameScreenTitle: "Game Room",
        masterWordLabel: "The word is:",
        foundWordsTitle: "Found words:",
        gameRoomCodeLabel: "Room code:",
        submitWordBtn: "Submit",
        gameModePrefix: "Mode:",
        gameModeSolo: "Solo",
        gameModeMultiplayer: "Multiplayer",
        scorePrefix: "Score:",
        emptyWordFeedback: "Write a word before submitting.",
        shortWordFeedback: "The word is too short.",
        repeatedWordFeedback: "That word has already been found.",
        masterWordFeedback: "You cannot submit the full master word.",
        validWordFeedback: "Valid word!",
        invalidWordFeedback: "Invalid word for this round.",
        noMatchFound: "No match found!",
        timeUpAlert: "Time is up!",
        wordInputPlaceholder: "Write a word...",

        /* Botão de troca de idioma */
        nextLang: "Português",
        flag: "/images/portuguese_icon.png",
    },
};

/* Estado do idioma atual */
let idiomaAtual = localStorage.getItem("idioma") || "pt";

/* Aplica o idioma atual à página onde estiver */
function aplicarIdioma() {
    const dados = traducoes[idiomaAtual];
    if (!dados) return;

    /* Elementos da homepage / comum */
    const elWelcome = document.getElementById("welcome-label");
    const elDesc = document.getElementById("description");
    const elLogin = document.getElementById("btn-login");
    const elRegister = document.getElementById("btn-register");

    /* Elementos do login */
    const elLoginSubtitle = document.querySelector(".auth-subtitle");
    const elLoginEmail = document.getElementById("login-email");
    const elLoginUsername = document.getElementById("login-username");
    const elLoginPassword = document.getElementById("login-password");
    const elLoginBtn = document.querySelector(".login-submit");

    /* Elementos do register */
    const elRegisterSubtitle = document.getElementById("register-subtitle");
    const elRegisterEmail = document.getElementById("register-email");
    const elRegisterUsername = document.getElementById("register-username");
    const elRegisterPassword = document.getElementById("register-password");
    const elRegisterConfirmPassword = document.getElementById(
        "register-confirm-password"
    );
    const elRegisterBtn = document.getElementById("register-button");

    /* Elementos do hub */
    const elNavHome = document.getElementById("nav-home");
    const elNavRanking = document.getElementById("nav-ranking");
    const elNavHow = document.getElementById("nav-how");
    const elCreateGame = document.getElementById("btn-create");
    const elRoomInput = document.getElementById("room-input");
    const elEnterBtn = document.getElementById("btn-enter-room");

    /* Elementos da How to Play */
    const elBack = document.querySelector(".back-button");
    const elCorrectTitle = document.querySelector(".answers-title");
    const rulesList = document.querySelectorAll(".rules-list li");
    const elExampleWord = document.querySelector(".word-badge");
    const elExampleAnswers = document.querySelectorAll(".answers-list li");
    const isHowToPage = document.querySelector(".howto-container");
    const elRulesTitle = isHowToPage ? isHowToPage.querySelector(".title-neon") : null;

    /* Elementos da Leaderboard */
    const elLeaderboardTitle = document.querySelector(".leaderboard-card .title-neon");
    const elTableHeaders = document.querySelectorAll(".table-header span");

    /* Elementos da Navbar */
    const navLinks = document.querySelectorAll(".nav-links a");

    /* Elementos do Profile */
    const elProfileTitle = document.querySelector(".stats-section .title-neon");
    const elBtnChangePhoto = document.getElementById("btn-change-photo"); 
    const elStatLabels = document.querySelectorAll(".stat-label");

    /* Elementos do Edit Profile */
    const elEditAvatarTitle = document.querySelector(".edit-title");
    const elChooseLabel = document.querySelector(".choose-label");

    /* Elementos da Create Match */
    const elCreateTitle = document.querySelector(".match-card .gradient-title");
    const elLabels = document.querySelectorAll(".match-card label");
    const elGameModeOptions = document.querySelectorAll("#game-mode option");
    const elCreateBtn = document.querySelector(".btn-create-match");

    /* Elementos do Lobby */
    const elLobbyTitle = document.querySelector(".lobby-card .gradient-title");
    const elStartBtn = document.querySelector(".lobby-card .btn-create-match");
    const elLobbyRoomCodeLabel = document.querySelector(".lobby-code label");
    const elBackButtonText = document.querySelector(".back-button .txt-back");

    /* Elementos do Game Screen */
    const elGameScreenTitle = document.getElementById("gamescreen-title");
    const elMasterWordLabel = document.getElementById("master-word-label");
    const elFoundWordsTitle = document.getElementById("found-words-title");
    const elGameRoomCodeLabel = document.getElementById("game-room-code-label");
    const elSubmitWordBtn = document.getElementById("submit-word-btn");
    const elPlayerWordInput = document.getElementById("player-word");

    /* Elementos do seletor de idioma */
    const elLangName = document.getElementById("lang-name");
    const elLangFlag = document.getElementById("lang-flag");

    /* Homepage / comum */
    if (elWelcome) elWelcome.innerText = dados.welcome;
    if (elDesc) elDesc.innerText = dados.description;
    if (elLogin) elLogin.innerText = dados.login;
    if (elRegister) elRegister.innerText = dados.register;

    /* Login */
    if (elLoginSubtitle) elLoginSubtitle.innerText = dados.loginSubtitle;
    if (elLoginEmail) elLoginEmail.placeholder = dados.email;
    if (elLoginUsername) elLoginUsername.placeholder = dados.username;
    if (elLoginPassword) elLoginPassword.placeholder = dados.password;
    if (elLoginBtn) elLoginBtn.innerText = dados.loginButton;

    /* Register */
    if (elRegisterSubtitle) elRegisterSubtitle.innerText = dados.registerSubtitle;
    if (elRegisterEmail) elRegisterEmail.placeholder = dados.email;
    if (elRegisterUsername) elRegisterUsername.placeholder = dados.username;
    if (elRegisterPassword) elRegisterPassword.placeholder = dados.password;
    if (elRegisterConfirmPassword) {
        elRegisterConfirmPassword.placeholder = dados.confirmPassword;
    }
    if (elRegisterBtn) elRegisterBtn.innerText = dados.registerButton;

    /* Hub */
    if (elNavHome) elNavHome.innerText = dados.navHome;
    if (elNavRanking) elNavRanking.innerText = dados.navRanking;
    if (elNavHow) elNavHow.innerText = dados.navHow;
    if (elCreateGame) elCreateGame.innerText = dados.createGame;
    if (elRoomInput) elRoomInput.placeholder = dados.enterRoom;
    if (elEnterBtn) elEnterBtn.innerText = dados.enter;

    /* How to Play */
    if (elBack) elBack.innerHTML = `<span>←</span> ${dados.back}`;
    if (elRulesTitle) {
      elRulesTitle.innerText = dados.rulesTitle;
    }
    if (elCorrectTitle) elCorrectTitle.innerText = dados.correctAnswers;
    if (rulesList.length > 0) {
      rulesList[0].innerHTML = `<strong>${dados.rule1}</strong> ${dados.rule1Desc}`;
      rulesList[1].innerHTML = `<strong>${dados.rule2}</strong> ${dados.rule2Desc}`;
      rulesList[2].innerHTML = `<strong>${dados.rule3}</strong> ${dados.rule3Desc}`;
      rulesList[3].innerHTML = `<strong>${dados.rule4}</strong> ${dados.rule4Desc}`;
      rulesList[4].innerText = dados.rule5;
    }
    if (elExampleWord) elExampleWord.innerText = dados.exampleWord;

      // Aplica a lista de respostas do exemplo
      if (elExampleAnswers.length > 0 && dados.exampleAnswers) {
          elExampleAnswers.forEach((li, index) => {
              if (dados.exampleAnswers[index]) {
                  li.innerText = dados.exampleAnswers[index];
              }
          });
      }

    // Leaderboard
    if (elLeaderboardTitle) elLeaderboardTitle.innerText = dados.leaderboardTitle;
    if (elTableHeaders.length >= 3) {
      elTableHeaders[0].innerText = dados.colPos;
      elTableHeaders[1].innerText = dados.colPlayer;
      elTableHeaders[2].innerText = dados.colScore;
    }

    // Navbar
    if (navLinks.length >= 3) {
      navLinks[0].innerText = dados.navStart;
      navLinks[1].innerText = dados.navLeaderboard;
      navLinks[2].innerText = dados.navHowTo;
    }

    /* Profile */
    if (elProfileTitle) elProfileTitle.innerText = dados.statsTitle;
    if (elBtnChangePhoto) elBtnChangePhoto.innerText = dados.changePhoto;
    if (elStatLabels.length >= 4) {
      elStatLabels[0].innerText = dados.statTotalScore;
      elStatLabels[1].innerText = dados.statCorrect;
      elStatLabels[2].innerText = dados.statWrong;
      elStatLabels[3].innerText = dados.statGames;
    }

    /* Edit Profile */
    if (elEditAvatarTitle) elEditAvatarTitle.innerText = dados.editAvatarTitle;
    if (elChooseLabel) elChooseLabel.innerText = dados.chooseImage;

    /* Create Match Page */
    if (elCreateTitle) elCreateTitle.innerText = dados.createMatchTitle;
    if (elCreateBtn) elCreateBtn.innerText = dados.createBtn;
  
    // Mapeia os labels (Modo de Jogo, Tempo Limite, Código da Sala)
    if (elLabels.length >= 3) {
      elLabels[0].innerText = dados.gameModeLabel;
      elLabels[1].innerText = dados.timeLimitLabel;
      elLabels[2].innerText = dados.roomCodeLabel;
    }

    // Mapeia as opções do select de Modo de Jogo
    if (elGameModeOptions.length >= 2) {
      elGameModeOptions[0].innerText = dados.multiplayer;
      elGameModeOptions[1].innerText = dados.solo;
    }

    /* Lobby */
    if (elLobbyTitle) elLobbyTitle.innerText = dados.lobbyTitle;
    if (elStartBtn) elStartBtn.innerText = dados.startMatchBtn;
    if (elLobbyRoomCodeLabel) elLobbyRoomCodeLabel.innerText = dados.lobbyRoomCodeLabel;
    if (elBackButtonText) elBackButtonText.innerText = dados.back;

    /* Game Screen */
    if (elGameScreenTitle) elGameScreenTitle.innerText = dados.gameScreenTitle;
    if (elMasterWordLabel) elMasterWordLabel.innerText = dados.masterWordLabel;
    if (elFoundWordsTitle) elFoundWordsTitle.innerText = dados.foundWordsTitle;
    if (elGameRoomCodeLabel) elGameRoomCodeLabel.innerText = dados.gameRoomCodeLabel;
    if (elSubmitWordBtn) elSubmitWordBtn.innerText = dados.submitWordBtn;
    if (elPlayerWordInput) elPlayerWordInput.placeholder = dados.wordInputPlaceholder;
    
    /* Botão de idioma: mostra sempre a próxima língua */
    if (elLangName) elLangName.innerText = dados.nextLang;
    
    if (elLangFlag) {
        // Se for uma tag <img> usa .src, se for uma <div> usa backgroundImage
        if (elLangFlag.tagName === "IMG") {
            elLangFlag.src = dados.flag;
        } else {
            elLangFlag.style.backgroundImage = `url('${dados.flag}')`;
        }
    }

    document.documentElement.lang = idiomaAtual === "pt" ? "pt-PT" : "en";
  }

/* Função de troca de idioma */
function toggleLanguage() {
    idiomaAtual = idiomaAtual === "pt" ? "en" : "pt";
    localStorage.setItem("idioma", idiomaAtual);
    aplicarIdioma();
}

function carregarAvatarSalvo() {
    const avatarSalvo = localStorage.getItem('userAvatar');
    
    // Procura a imagem da navbar
    const imagemNavbar = document.getElementById('nav-profile-avatar');
    
    // Procura a imagem grande da página de perfil
    const imagemPerfilGrande = document.getElementById('main-profile-img');

    if (avatarSalvo) {
        if (imagemNavbar) {
            imagemNavbar.src = avatarSalvo;
        }
        if (imagemPerfilGrande) {
            imagemPerfilGrande.src = avatarSalvo;
        }
    }
}

// Função para aplicar o nome em qualquer página --- */
function aplicarNomeUtilizador() {
    const nome = localStorage.getItem("user") || localStorage.getItem("username");
    if (!nome) return;

    // Lista de IDs 
    const idsPossiveis = [
        "user-display-name",        // ID na página Profile
        "player-username-display",   // ID na página Lobby
        "nav-user-name"
    ];
    
    idsPossiveis.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.innerText = nome;
        }
    });
}

/* Inicialização */
document.addEventListener("DOMContentLoaded", () => {
    aplicarIdioma();
    carregarAvatarSalvo();
    aplicarNomeUtilizador();

    // Event listener para o botão de troca de idioma 
    const btnLang = document.getElementById("btn-toggle-lang");
    if (btnLang) {
        btnLang.addEventListener("click", toggleLanguage);
    }
});

