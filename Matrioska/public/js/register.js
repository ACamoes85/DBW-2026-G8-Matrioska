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

const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparFeedback("register-feedback");

    const email = document.getElementById("register-email").value;
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;

    if (password !== confirmPassword) {
      mostrarFeedback("register-feedback", t("passwordMismatch", "As passwords não coincidem."), "error");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, confirmPassword }),
      });

      const data = await response.json();
      const code = data.code || "serverError";

      if (response.ok) {
        mostrarFeedback("register-feedback", t(code, "Conta criada! Bem-vindo."), "success");
        setTimeout(() => { window.location.href = "/hub"; }, 800);
      } else {
        mostrarFeedback("register-feedback", t(code, "Erro ao realizar registo."), "error");
      }
    } catch (error) {
      console.error("Erro:", error);
      mostrarFeedback("register-feedback", t("connectionError", "Erro ao ligar ao servidor."), "error");
    }
  });
}