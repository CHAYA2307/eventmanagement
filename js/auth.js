// js/auth.js
// Lightweight client-side auth demo (for real: use a backend with JWT and hashed passwords)
(async () => {
  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  // Signup flow
  const doSignupBtn = document.getElementById('doSignup');
  if (doSignupBtn) {
    doSignupBtn.addEventListener('click', async () => {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('su_email').value.trim();
      const pwd = document.getElementById('su_password').value;
      const msg = document.getElementById('signupMsg');
      if (!name || !email || !pwd) { msg.textContent = 'Fill all fields'; return; }
      const hash = await sha256(pwd);
      // Demo storage (replace with POST to backend)
      localStorage.setItem('es_user', JSON.stringify({name,email,hash}));
      msg.style.color = '#7c5cff';
      msg.textContent = 'Account created (demo) — you are logged in.';
      setTimeout(()=> location.href = 'customer-dashboard.html', 900);
    });
  }

  // Login flow
  const doLoginBtn = document.getElementById('doLogin');
  if (doLoginBtn) {
    doLoginBtn.addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();
      const pwd = document.getElementById('password').value;
      const msg = document.getElementById('loginMsg');
      if (!email || !pwd) { msg.textContent = 'Provide email & password'; return; }
      const hash = await sha256(pwd);
      const stored = JSON.parse(localStorage.getItem('es_user') || 'null');
      if (!stored || stored.email !== email) { msg.textContent = 'User not found (demo)'; return; }
      if (stored.hash !== hash) { msg.textContent = 'Invalid password'; return; }
      // demo: set a token
      localStorage.setItem('es_token', btoa(JSON.stringify({email})));
      msg.style.color = '#7c5cff';
      msg.textContent = 'Login successful — redirecting...';
      setTimeout(()=> location.href = 'customer-dashboard.html', 600);
    });
  }

  // Google OAuth demo button
  const googleBtn = document.getElementById('googleLogin');
  if (googleBtn) googleBtn.addEventListener('click', ()=> alert('Google OAuth placeholder — implement server-side OAuth flow.'));

})();
