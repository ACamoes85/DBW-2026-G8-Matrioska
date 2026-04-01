document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // lógica de registo
    console.log("Formulário de registo submetido.");
  });
});
