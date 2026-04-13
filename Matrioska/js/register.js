document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("register-email").value;
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;

    // validações básicas
    if (!email || !username || !password || !confirmPassword) {
      alert("Preenche todos os campos!");
      return;
    }

    if (password !== confirmPassword) {
      alert("As palavras-passe não coincidem!");
      return;
    }

    // guardar utilizador no localStorage
    const user = {
      email,
      username,
      password
    };

    localStorage.setItem("userData", JSON.stringify(user));

    localStorage.setItem("username", username);

    console.log("Utilizador registado:", user);

    alert("Registo feito com sucesso!");

    // redirecionar para o hub
    window.location.href = "hub.html";
  });
});
