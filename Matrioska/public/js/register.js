"use strict";

const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('register-email').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Verificação básica no cliente antes de enviar ao servidor
        if (password !== confirmPassword) {
            alert("As passwords não coincidem!");
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password, confirmPassword })
            });

            const data = await response.json();

            if (response.ok) {
                // Aqui está o que pediste: redirecionar direto para o HUB
                alert("Registo concluído com sucesso! Bem-vindo.");
                window.location.href = '/hub'; 
            } else {
                alert(data.message || "Erro ao realizar registo.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao ligar ao servidor.");
        }
    });
}