// Configuration: Replace with your Render URL when deployed (e.g., https://your-api.onrender.com)
const API_URL = "https://db2-login-o617.onrender.com".replace(/\/+$/, ""); // Replace with your Render URL when deployed
// const API_URL = "http://localhost:5000";

const loginSection = document.getElementById("loginSection");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const toggleAuth = document.getElementById("toggleAuth");
const switchText = document.getElementById("switchText");

let isRegisterMode = false;

// Toggle between Login and Register views
if (switchText) {
  switchText.addEventListener("click", (e) => {
    const targetLink = e.target.closest("#toggleAuth");
    if (!targetLink) return;
    e.preventDefault();

    isRegisterMode = !isRegisterMode;

    const loginMsg = document.getElementById("message");
    const regMsg = document.getElementById("registerMessage");
    if (loginMsg) { loginMsg.textContent = ""; loginMsg.className = ""; }
    if (regMsg) { regMsg.textContent = ""; regMsg.className = ""; }

    if (isRegisterMode) {
      loginSection.classList.add("hidden");
      registerForm.classList.remove("hidden");
      switchText.innerHTML = `Already have an account? <a href="#" id="toggleAuth">Login</a>`;
    } else {
      registerForm.classList.add("hidden");
      loginSection.classList.remove("hidden");
      switchText.innerHTML = `Don't have an account? <a href="#" id="toggleAuth">Register</a>`;
    }
  });
}

// Handle Login submission
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const messageEl = document.getElementById("message");
    const loginBtn = document.getElementById("loginBtn");

    messageEl.textContent = "Logging in...";
    messageEl.className = "";
    loginBtn.disabled = true;

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        // Not JSON
      }

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        messageEl.textContent = "Login successful! Redirecting...";
        messageEl.className = "success";
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 500);
      } else {
        messageEl.textContent = data.message || "Invalid email or password.";
        messageEl.className = "error";
        loginBtn.disabled = false;
      }
    } catch (err) {
      messageEl.textContent = "Cannot connect to server. Please try again.";
      messageEl.className = "error";
      loginBtn.disabled = false;
    }
  });
}

// Handle Register submission
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const regMessageEl = document.getElementById("registerMessage");
    const regBtn = document.getElementById("regBtn");

    if (password.length < 6) {
      regMessageEl.textContent = "Password must be at least 6 characters.";
      regMessageEl.className = "error";
      return;
    }

    regMessageEl.textContent = "Creating account...";
    regMessageEl.className = "";
    regBtn.disabled = true;

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        // Not JSON
      }

      if (res.ok) {
        regMessageEl.textContent = data.message || "Registration successful!";
        regMessageEl.className = "success";

        // Switch to login form after registration
        setTimeout(() => {
          registerForm.reset();
          isRegisterMode = false;
          registerForm.classList.add("hidden");
          loginSection.classList.remove("hidden");
          switchText.innerHTML = `Don't have an account? <a href="#" id="toggleAuth">Register</a>`;
          document.getElementById("email").value = email;
          const loginMsg = document.getElementById("message");
          loginMsg.textContent = "Account registered! Please enter your password.";
          loginMsg.className = "success";
          regBtn.disabled = false;
        }, 1200);
      } else {
        regMessageEl.textContent = data.message || "Registration failed.";
        regMessageEl.className = "error";
        regBtn.disabled = false;
      }
    } catch (err) {
      regMessageEl.textContent = "Cannot connect to server. Please try again.";
      regMessageEl.className = "error";
      regBtn.disabled = false;
    }
  });
}
