function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");
  
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");
  
    const nameErr = document.getElementById("nameErr");
    const emailErr = document.getElementById("emailErr");
    const msgErr = document.getElementById("msgErr");
  
    function clearErrors() {
      nameErr.textContent = "";
      emailErr.textContent = "";
      msgErr.textContent = "";
      status.textContent = "";
    }
  
    function validate() {
      clearErrors();
      let ok = true;
  
      if (name.value.trim().length < 2) {
        nameErr.textContent = "Imię musi mieć min. 2 znaki.";
        ok = false;
      }
  
      if (!isEmail(email.value)) {
        emailErr.textContent = "Podaj poprawny adres email.";
        ok = false;
      }
  
      if (message.value.trim().length < 10) {
        msgErr.textContent = "Wiadomość musi mieć min. 10 znaków.";
        ok = false;
      }
  
      return ok;
    }
  
 
    [name, email, message].forEach((el) => {
      el.addEventListener("blur", () => validate());
    });
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = validate();
  
      if (!ok) {
        status.textContent = "Popraw błędy w formularzu.";
        return;
      }
  

      status.textContent = "✅ Wiadomość wysłana (tryb demo).";
      form.reset();
    });
  });
  