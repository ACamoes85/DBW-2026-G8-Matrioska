"use strict";

const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("user", username);
                window.location.href = '/hub';
            } else {
                alert(data.message || "Credenciais incorretas.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao ligar ao servidor.");
        }
    });
}