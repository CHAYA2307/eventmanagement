// js/auth.js (BACKEND VERSION)
(async () => {
  const BASE_URL = "http://localhost:5000/api/auth";

  function showMessage(el, msg, color = "red") {
    el.style.color = color;
    el.textContent = msg;
  }

  // SIGNUP
  const doSignupBtn = document.getElementById("doSignup");
  if (doSignupBtn) {
    doSignupBtn.addEventListener("click", async () => {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("su_email").value.trim();
      const password = document.getElementById("su_password").value.trim();
      const msg = document.getElementById("signupMsg");

      if (!name || !email || !password) {
        showMessage(msg, "Please fill all fields");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          showMessage(msg, "Account created! Redirecting...", "#7c5cff");
          localStorage.setItem("es_token", data.token);
          setTimeout(() => (window.location.href = "index.html"), 1000);
        } else {
          showMessage(msg, data.msg || "Signup failed");
        }
      } catch (err) {
        showMessage(msg, "Server error, try later");
      }
    });
  }

  // LOGIN
  const doLoginBtn = document.getElementById("doLogin");
  if (doLoginBtn) {
    doLoginBtn.addEventListener("click", async () => {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const msg = document.getElementById("loginMsg");

      if (!email || !password) {
        showMessage(msg, "Enter email and password");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          showMessage(msg, "Login successful! Redirecting...", "#7c5cff");
          localStorage.setItem("es_token", data.token);
          setTimeout(() => (window.location.href = "customer-dashboard.html"), 1000);
        } else {
          showMessage(msg, data.msg || "Invalid credentials");
        }
      } catch (err) {
        console.error(err);
        showMessage(msg, "Server error");
      }
    });
  }

})();
