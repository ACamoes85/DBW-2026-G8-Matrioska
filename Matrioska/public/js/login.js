"use strict";

const t = (chave, fallback) => {
  return window.texto ? window.texto(chave) : fallback;
};

function mostrarFeedback(id, mensagem, tipo) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = mensagem;
  el.className = `auth-feedback auth-feedback--${tipo}`;
}

function limparFeedback(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = "";
  el.className = "auth-feedback";
}

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparFeedback("login-feedback");

    const email = document.getElementById("login-email").value;
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();
      const code = data.code || "serverError";

      if (response.ok) {
        localStorage.setItem("user", username);
        mostrarFeedback("login-feedback", t(code, "Login efetuado! A redirecionar..."), "success");
        setTimeout(() => { window.location.href = "/hub"; }, 800);
      } else {
        mostrarFeedback("login-feedback", t(code, "Credenciais incorretas."), "error");
      }
    } catch (error) {
      console.error("Erro:", error);
      mostrarFeedback("login-feedback", t("connectionError", "Erro ao ligar ao servidor."), "error");
    }
  });
}