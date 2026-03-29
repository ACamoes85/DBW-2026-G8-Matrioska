/* Dicionário de textos para multi-idioma */
const traducoes = {
    pt: {
        welcome: "Bem-vindo ao",
        description: "Revela o máximo de palavras antes que o tempo se esgote.",
        login: "Entrar",
        register: "Registar",
        nextLang: "English",
        flag: "../images/english_icon.png"
    },
    en: {
        welcome: "Welcome to",
        description: "Uncover hidden words before time runs out.",
        login: "Login",
        register: "Register",
        nextLang: "Português",
        flag: "../images/portuguese_icon.png"
    }
};

/* Estado do idioma atual */
let idiomaAtual = 'pt';

/* Função de troca de idioma */
function toggleLanguage() {
    idiomaAtual = (idiomaAtual === 'pt') ? 'en' : 'pt';
    const dados = traducoes[idiomaAtual];

    /* Referências aos elementos do DOM */
    const elWelcome = document.getElementById('welcome-label');
    const elDesc = document.getElementById('description');
    const elLogin = document.getElementById('btn-login');
    const elRegister = document.getElementById('btn-register');
    const elLangName = document.getElementById('lang-name');
    const elLangFlag = document.getElementById('lang-flag');

    /* Atualização segura dos textos */
    if (elWelcome) elWelcome.innerText = dados.welcome;
    if (elDesc) elDesc.innerText = dados.description;
    if (elLogin) elLogin.innerText = dados.login;
    if (elRegister) elRegister.innerText = dados.register;
    if (elLangName) elLangName.innerText = dados.nextLang;

    /* Atualização visual da bandeira */
    if (elLangFlag) {
        elLangFlag.style.backgroundImage = `url('${dados.flag}')`;
    }
}

/* Inicialização e gestão de eventos */
document.addEventListener('DOMContentLoaded', () => {
    
    /* Listener para cliques nos botões principais */
    const botoes = document.querySelectorAll('.btn-custom');
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            /* Lógica de navegação ou eventos adicionais aqui */
        });
    });
});