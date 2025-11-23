(async () => {

  // FIXED BACKEND URL FOR LOCAL DEVELOPMENT
  const BASE_URL = "http://localhost:5000/api/auth";

  function showMessage(el, msg, color = "red") {
    el.style.color = color;
    el.textContent = msg;
  }

  // ========== SIGNUP ==========
  const doSignupBtn = document.getElementById("doSignup");
  if (doSignupBtn) {
    doSignupBtn.addEventListener("click", async (e) => {
      e.preventDefault();

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
        console.log("Signup Response:", data);

        if (res.ok && data.token) {
          showMessage(msg, "Signup successful! Redirecting...", "green");

          localStorage.setItem("es_token", data.token);
          localStorage.setItem("user_role", data.user.role);

          setTimeout(() => {
            window.location.href =
              data.user.role === "admin" ? "admin-dashboard.html" : "customer-dashboard.html";
          }, 1000);

        } else {
          showMessage(msg, data.msg || "Signup failed");
        }
      } catch (err) {
        console.error(err);
        showMessage(msg, "Server error, try later");
      }
    });
  }

  // ========== LOGIN ==========
  const doLoginBtn = document.getElementById("doLogin");
  if (doLoginBtn) {
    doLoginBtn.addEventListener("click", async (e) => {
      e.preventDefault();

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
        console.log("Login Response:", data);

        if (res.ok && data.token) {
          showMessage(msg, "Login successful! Redirecting...", "green");

          localStorage.setItem("es_token", data.token);
          localStorage.setItem("user_role", data.user.role);

          setTimeout(() => {
            window.location.href =
              data.user.role === "admin" ? "admin-dashboard.html" : "customer-dashboard.html";
          }, 1000);

        } else {
          showMessage(msg, data.msg || "Invalid email or password");
        }

      } catch (err) {
        console.error(err);
        showMessage(msg, "Server error");
      }
    });
  }

})();
