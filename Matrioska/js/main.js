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

        /* Botão de troca de idioma */
        nextLang: "English",
        flag: "../images/english_icon.png",
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

        /* Botão de troca de idioma */
        nextLang: "Português",
        flag: "../images/portuguese_icon.png",
    },
};

/* Estado do idioma atual */
let idiomaAtual = localStorage.getItem("idioma") || "pt";

/* Aplica o idioma atual à página onde estiver */
function aplicarIdioma() {
    const dados = traducoes[idiomaAtual];

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

    /* Botão de idioma: mostra sempre a próxima língua */
    if (elLangName) elLangName.innerText = dados.nextLang;
    if (elLangFlag) elLangFlag.src = dados.flag;

    document.documentElement.lang = idiomaAtual === "pt" ? "pt-PT" : "en";
}

/* Função de troca de idioma */
function toggleLanguage() {
    idiomaAtual = idiomaAtual === "pt" ? "en" : "pt";
    localStorage.setItem("idioma", idiomaAtual);
    aplicarIdioma();
}

/* Inicialização */
document.addEventListener("DOMContentLoaded", () => {
    aplicarIdioma();

    const botoes = document.querySelectorAll(".btn-custom");
    botoes.forEach((botao) => {
        botao.addEventListener("click", () => {
            /* lógica futura */
        });
    });
});

/* Botão Entrar para Lobby.html */
document.addEventListener("DOMContentLoaded", () => {
    aplicarIdioma();

    const btnEnter = document.getElementById("btn-enter-room");

    if (btnEnter) {
        btnEnter.addEventListener("click", () => {
            window.location.href = "lobby.html";
        });
    }
});