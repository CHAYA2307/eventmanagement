document.getElementById('doLogin').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const loginMsg = document.getElementById('loginMsg');

  if (!email || !password) {
    loginMsg.style.color = 'red';
    loginMsg.textContent = "Please enter email and password";
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (res.ok && data.success) {
      loginMsg.style.color = 'green';
      loginMsg.textContent = "Login successful! Redirecting...";

      localStorage.setItem('token', data.token); // store JWT

      setTimeout(() => {
        window.location.href = '/dashboard.html'; // change to your protected page
      }, 1000);

    } else {
      loginMsg.style.color = 'red';
      loginMsg.textContent = data.msg || "Login failed";
    }

  } catch (err) {
    console.error("Login error:", err);
    loginMsg.style.color = 'red';
    loginMsg.textContent = "Server error. Try again later.";
  }
});
