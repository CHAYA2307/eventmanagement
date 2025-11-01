// js/auth.js
(async () => {
  const API_BASE = "http://localhost:5000/api"; // ✅ Backend URL

  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ✅ Signup flow
  const doSignupBtn = document.getElementById('doSignup');
  if (doSignupBtn) {
    doSignupBtn.addEventListener('click', async () => {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('su_email').value.trim();
      const pwd = document.getElementById('su_password').value;
      const msg = document.getElementById('signupMsg');

      if (!name || !email || !pwd) {
        msg.textContent = 'Fill all fields';
        msg.style.color = 'red';
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/users/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password: pwd })
        });

        const data = await res.json();

        if (res.ok) {
          msg.style.color = '#7c5cff';
          msg.textContent = 'Account created successfully — redirecting...';
          setTimeout(() => location.href = 'customer-dashboard.html', 900);
        } else {
          msg.style.color = 'red';
          msg.textContent = data.message || 'Signup failed';
        }
      } catch (err) {
        msg.style.color = 'red';
        msg.textContent = 'Server error. Please try again.';
      }
    });
  }

  // ✅ Login flow
  const doLoginBtn = document.getElementById('doLogin');
  if (doLoginBtn) {
    doLoginBtn.addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();
      const pwd = document.getElementById('password').value;
      const msg = document.getElementById('loginMsg');

      if (!email || !pwd) {
        msg.textContent = 'Provide email & password';
        msg.style.color = 'red';
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pwd })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem('es_token', data.token); // ✅ save backend token
          msg.style.color = '#7c5cff';
          msg.textContent = 'Login successful — redirecting...';
          setTimeout(() => location.href = 'customer-dashboard.html', 600);
        } else {
          msg.style.color = 'red';
          msg.textContent = data.message || 'Invalid credentials';
        }
      } catch (err) {
        msg.style.color = 'red';
        msg.textContent = 'Server error. Please try again.';
      }
    });
  }

  // ✅ Google OAuth placeholder
  const googleBtn = document.getElementById('googleLogin');
  if (googleBtn)
    googleBtn.addEventListener('click', () =>
      alert('Google OAuth placeholder — implement server-side OAuth flow.')
    );
})();
