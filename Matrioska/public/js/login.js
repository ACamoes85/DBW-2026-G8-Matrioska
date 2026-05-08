document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const storedUser = JSON.parse(localStorage.getItem("userData"));

    if (!storedUser) {
      alert("Nenhum utilizador registado!");
      return;
    }

    if (username === storedUser.username && password === storedUser.password) {
      localStorage.setItem("user", username);
      window.location.href = "/hub";
    } else {
      alert("Credenciais inválidas!");
    }
  });
});