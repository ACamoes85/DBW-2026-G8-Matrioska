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

<<<<<<< HEAD
    localStorage.setItem("username", username);

=======
>>>>>>> 0cf1e80c552c6dd202af9327ad2825c17a914b51
    console.log("Utilizador registado:", user);

    alert("Registo feito com sucesso!");

<<<<<<< HEAD
    // redirecionar para o hub
    window.location.href = "hub.html";
=======
    // redirecionar para login
    window.location.href = "login.html";
>>>>>>> 0cf1e80c552c6dd202af9327ad2825c17a914b51
  });
});