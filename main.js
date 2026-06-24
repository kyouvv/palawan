/* ═══════════════════════════
   PALAWAN TOURISM — main.js
═══════════════════════════ */

// ── Auth State ──────────────────────────────
const AUTH_KEY = 'palawan_user';

function getUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}
function saveUser(u) { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }
function logout() { localStorage.removeItem(AUTH_KEY); location.reload(); }

function updateNavAuth() {
  const user = getUser();
  const loginBtn   = document.getElementById('navLoginBtn');
  const signupBtn  = document.querySelector('.btn-signup');
  const userMenu   = document.getElementById('userMenu');
  const greeting   = document.getElementById('userGreeting');
  const mobileLogin = document.getElementById('mobileLoginBtn');

  if (user) {
    if (loginBtn)  loginBtn.classList.add('hidden');
    if (signupBtn) signupBtn.classList.add('hidden');
    if (userMenu)  { userMenu.classList.remove('hidden'); }
    if (greeting)  greeting.textContent = `Hi, ${user.name.split(' ')[0]}!`;
    if (mobileLogin) mobileLogin.textContent = 'My Account';
  }
}

// ── Navbar Scroll ────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Hamburger
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobileMenu');
  if (ham && mob) {
    ham.addEventListener('click', () => mob.classList.toggle('hidden'));
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

// ── Slider ───────────────────────────────────
function initSlider() {
  const slider = document.getElementById('destSlider');
  const dotsContainer = document.getElementById('sliderDots');
  if (!slider || !dotsContainer) return;

  const cards = slider.querySelectorAll('.dest-card');
  const count = Math.ceil(cards.length / 2); // approximate pages
  let activeDot = 0;

  dotsContainer.innerHTML = '';
  for (let i = 0; i < cards.length; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    });
    dotsContainer.appendChild(d);
  }

  slider.addEventListener('scroll', () => {
    const dots = dotsContainer.querySelectorAll('.dot');
    let closest = 0, minDist = Infinity;
    cards.forEach((c, i) => {
      const dist = Math.abs(c.getBoundingClientRect().left - slider.getBoundingClientRect().left);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === closest));
  });
}

// ── Scroll Reveal ────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ── Toast ────────────────────────────────────
function showToast(msg, type = 'success') {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = `toast ${type}`;
  requestAnimationFrame(() => { t.classList.add('show'); });
  setTimeout(() => { t.classList.remove('show'); }, 3400);
}

// ── Filter Bar (Destinations page) ───────────
function initFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.dest-full-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const tag = card.dataset.tag || '';
        const show = filter === 'all' || tag === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

// ── Contact Form ─────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Basic validation
    const fields = form.querySelectorAll('[required]');
    fields.forEach(f => {
      const err = f.parentElement.querySelector('.form-error');
      if (!f.value.trim()) {
        if (err) err.style.display = 'block';
        f.style.borderColor = 'var(--coral)';
        valid = false;
      } else {
        if (err) err.style.display = 'none';
        f.style.borderColor = '';
      }
    });

    // Email format
    const emailField = form.querySelector('[type="email"]');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      const err = emailField.parentElement.querySelector('.form-error');
      if (err) { err.textContent = 'Please enter a valid email.'; err.style.display = 'block'; }
      emailField.style.borderColor = 'var(--coral)';
      valid = false;
    }

    if (!valid) { showToast('Please fill in all required fields.', 'error'); return; }

    // Simulate submission
    const successMsg = document.getElementById('formSuccess');
    if (successMsg) successMsg.style.display = 'block';
    form.reset();
    showToast('Message sent! We\'ll get back to you soon. 🌴', 'success');
    setTimeout(() => { if (successMsg) successMsg.style.display = 'none'; }, 5000);
  });
}

// ── Auth Forms (Login/Signup page) ───────────
function initAuth() {
  const tabs    = document.querySelectorAll('.auth-tab');
  const panels  = document.querySelectorAll('.auth-form-panel');
  if (!tabs.length) return;

  // Switch tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('active');
    });
  });

  // Check if URL hash is #signup
  if (location.hash === '#signup') {
    const signupTab = document.querySelector('[data-target="signupPanel"]');
    if (signupTab) signupTab.click();
  }

  // ── LOGIN ──
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('#loginEmail').value.trim();
      const pass  = loginForm.querySelector('#loginPass').value;
      const alert = document.getElementById('loginAlert');

      // Check against stored users
      const users = JSON.parse(localStorage.getItem('palawan_users') || '[]');
      const user = users.find(u => u.email === email && u.password === pass);

      if (!user) {
        alert.textContent = 'Invalid email or password.';
        alert.className = 'auth-alert error';
        alert.style.display = 'block';
        return;
      }
      alert.className = 'auth-alert success';
      alert.textContent = `Welcome back, ${user.name}! Redirecting...`;
      alert.style.display = 'block';
      saveUser(user);
      setTimeout(() => { location.href = 'index.html'; }, 1200);
    });
  }

  // ── SIGNUP ──
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = signupForm.querySelector('#signupName').value.trim();
      const email   = signupForm.querySelector('#signupEmail').value.trim();
      const pass    = signupForm.querySelector('#signupPass').value;
      const confirm = signupForm.querySelector('#signupConfirm').value;
      const alert   = document.getElementById('signupAlert');

      // Validation
      if (!name || !email || !pass || !confirm) {
        alert.textContent = 'Please fill in all fields.';
        alert.className = 'auth-alert error';
        alert.style.display = 'block';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert.textContent = 'Please enter a valid email address.';
        alert.className = 'auth-alert error';
        alert.style.display = 'block';
        return;
      }
      if (pass.length < 6) {
        alert.textContent = 'Password must be at least 6 characters.';
        alert.className = 'auth-alert error';
        alert.style.display = 'block';
        return;
      }
      if (pass !== confirm) {
        alert.textContent = 'Passwords do not match.';
        alert.className = 'auth-alert error';
        alert.style.display = 'block';
        return;
      }

      // Check duplicate email
      const users = JSON.parse(localStorage.getItem('palawan_users') || '[]');
      if (users.find(u => u.email === email)) {
        alert.textContent = 'An account with that email already exists.';
        alert.className = 'auth-alert error';
        alert.style.display = 'block';
        return;
      }

      const newUser = { name, email, password: pass, joined: new Date().toISOString() };
      users.push(newUser);
      localStorage.setItem('palawan_users', JSON.stringify(users));
      saveUser(newUser);

      alert.textContent = `Account created! Welcome, ${name}! 🌴`;
      alert.className = 'auth-alert success';
      alert.style.display = 'block';
      setTimeout(() => { location.href = 'index.html'; }, 1300);
    });
  }
}

// ── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();
  initNavbar();
  initSlider();
  initReveal();
  initFilter();
  initContactForm();
  initAuth();

  // Add reveal class to key sections dynamically
  document.querySelectorAll('.intro-text, .intro-map, .dest-full-card, .exp-card, .contact-info, .contact-form').forEach(el => {
    el.classList.add('reveal');
  });
  // Re-run observer after adding classes
  initReveal();
});