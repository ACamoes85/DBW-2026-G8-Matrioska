document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");

    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("register-email").value;
        const username = document.getElementById("register-username").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-confirm-password").value;

        if (!email || !username || !password || !confirmPassword) {
            alert("Preenche todos os campos!");
            return;
        }

        if (password !== confirmPassword) {
            alert("As palavras-passe não coincidem!");
            return;
        }

        const user = {
            email,
            username,
            password
        };

        localStorage.setItem("userData", JSON.stringify(user));
        localStorage.setItem("user", username); // Usado pelo lobby.js

        alert("Registo feito com sucesso!");
        window.location.href = "/hub";
    });
});