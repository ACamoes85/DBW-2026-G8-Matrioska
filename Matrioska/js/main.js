/* Dicionário de textos para multi-idioma */
const traducoes = {
  pt: {
    /* Homepage */
    welcome: "Bem-vindo ao",
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

    /* How to Play */
    back: "← Voltar",
    rulesTitle: "Como jogar",
    rule1: "Palavra-Mestra:",
    rule1Desc: "No teu ecrã irá aparecer uma \"Palavra-Mestra\".",
    rule2: "Palavras escondidas:",
    rule2Desc: "O teu objetivo é encontrar palavras menores dentro dela.",
    rule3: "Regra:",
    rule3Desc: "As letras podem estar em sequência direta ou indireta.",
    rule4: "Pontuação:",
    rule4Desc: "Quanto maior a palavra, mais pontos obténs.",
    rule5: "Aqui está um exemplo prático:",
    correctAnswers: "Respostas corretas:",

    /* Botão de troca de idioma */
    nextLang: "English",
    flag: "../images/english_icon.png",
  },

  en: {
    /* Homepage */
    welcome: "Welcome to",
    description: "Uncover hidden words before time runs out.",
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
    confirmPassword: "Confirm Password",
    registerButton: "Register",

    /* How to Play */
    back: "← Back",
    rulesTitle: "How to Play",
    rule1: "Master Word:",
    rule1Desc: "A \"Master Word\" will appear on your screen.",
    rule2: "Hidden words:",
    rule2Desc: "Your goal is to find smaller words within it.",
    rule3: "Rule:",
    rule3Desc: "Letters can be in direct or indirect sequence.",
    rule4: "Scoring:",
    rule4Desc: "The longer the word, the more points you get.",
    rule5: "Here is a practical example:",
    correctAnswers: "Correct answers:",

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

  /* Elementos da homepage */
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
    "register-confirm-password",
  );
  const elRegisterBtn = document.getElementById("register-button");

  /* Elementos da How to Play */
  const elBack = document.querySelector(".back-button");
  const elRulesTitle = document.querySelector(".title-neon");
  const elCorrectTitle = document.querySelector(".answers-title");
  const rulesList = document.querySelectorAll(".rules-list li");

  /* Elementos do seletor de idioma */
  const elLangName = document.getElementById("lang-name");
  const elLangFlag = document.getElementById("lang-flag");

  /* Homepage */
  if (elWelcome) elWelcome.innerText = dados.welcome;
  if (elDesc) elDesc.innerText = dados.description;
  if (elLogin) elLogin.innerText = dados.login;
  if (elRegister) elRegister.innerText = dados.register;

  /* Login */
  if (elLoginSubtitle && elLoginEmail)
    elLoginSubtitle.innerText = dados.loginSubtitle;
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

  /* Aplicar How to Play */
  if (elBack) elBack.innerHTML = `<span>←</span> ${dados.back}`;
  if (elRulesTitle) elRulesTitle.innerText = dados.rulesTitle;
  if (elCorrectTitle) elCorrectTitle.innerText = dados.correctAnswers;
  if (rulesList.length > 0) {
    rulesList[0].innerHTML = `<strong>${dados.rule1}</strong> ${dados.rule1Desc}`;
    rulesList[1].innerHTML = `<strong>${dados.rule2}</strong> ${dados.rule2Desc}`;
    rulesList[2].innerHTML = `<strong>${dados.rule3}</strong> ${dados.rule3Desc}`;
    rulesList[3].innerHTML = `<strong>${dados.rule4}</strong> ${dados.rule4Desc}`;
    rulesList[4].innerText = dados.rule5;
  }

  /* Botão de idioma: mostra sempre a próxima língua */
  if (elLangName) elLangName.innerText = dados.nextLang;

  if (elLangFlag) {
    elLangFlag.style.backgroundImage = `url('${dados.flag}')`;
  }

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
