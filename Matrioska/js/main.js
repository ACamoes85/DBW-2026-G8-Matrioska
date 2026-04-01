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
