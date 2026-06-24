/* ══════════════════════════════════════════
   PALAWAN TOURISM — AJAX Core Application Engine
══════════════════════════════════════════ */

// Global session cache populated by the server response
let globalUserSession = null;

// ── Sync Auth State via AJAX ────────────────
async function syncAuthState() {
  try {
    const response = await fetch('auth_status.php');
    const data = await response.json();
    
    if (data.authenticated) {
      globalUserSession = data.user; // Contains: id, username, email
    } else {
      globalUserSession = null;
    }
  } catch (error) {
    console.error('Session verification exception:', error);
    globalUserSession = null;
  }
  updateNavUI();
}

// ── Dynamic Custom UI States ────────────────
function updateNavUI() {
  const loginBtn = document.getElementById('navLoginBtn');
  const signupBtn = document.querySelector('.btn-signup');
  const userMenu = document.getElementById('userMenu');
  const greeting = document.getElementById('userGreeting');
  const mobileLogin = document.getElementById('mobileLoginBtn');
  const contactLinks = document.querySelectorAll('a[href="contact.html"]');

  if (globalUserSession) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (signupBtn) signupBtn.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (greeting) {
      // Show first name
      const firstName = globalUserSession.username.split(' ')[0];
      greeting.textContent = `Hi, ${firstName}!`;
    }
    if (mobileLogin) mobileLogin.textContent = 'My Account';
    
    // Grant access to contact page links
    contactLinks.forEach(link => link.classList.remove('hidden'));
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (signupBtn) signupBtn.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    if (mobileLogin) mobileLogin.textContent = 'Log In';
    
    // Hide contact link in main desktop nav if logged out
    contactLinks.forEach(link => {
      if (!link.closest('.mobile-menu')) {
        link.classList.add('hidden');
      }
    });
  }
}

// ── Navigation Bar Interactivity ────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobileMenu');
  if (ham && mob) {
    ham.addEventListener('click', () => mob.classList.toggle('hidden'));
  }

  // Bind logout listener
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const fd = new FormData();
      fd.append('action', 'logout');
      
      try {
        const response = await fetch('auth_handler.php', { method: 'POST', body: fd });
        const data = await response.json();
        if (data.status === 'success') {
          showToast('Logged out successfully!', 'success');
          setTimeout(() => { location.href = 'index.html'; }, 1000);
        }
      } catch (err) {
        showToast('Logout connection dropped.', 'error');
      }
    });
  }
}

// ── Authentication Handlers ─────────────────
function initAuthFormProcessing() {
  // Tabs toggle logic
  const tabs = document.querySelectorAll('.auth-tab');
  const panels = document.querySelectorAll('.auth-form-panel');
  if (tabs.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.target);
        if (target) target.classList.add('active');
      });
    });
    // Deep linking check for #signup
    if (location.hash === '#signup') {
      const signupTab = document.querySelector('[data-target="signupPanel"]');
      if (signupTab) signupTab.click();
    }
  }

  // Process Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPass').value;
      const alertBox = document.getElementById('loginAlert');

      const fd = new FormData();
      fd.append('action', 'login');
      fd.append('email', email);
      fd.append('password', password);

      try {
        const response = await fetch('auth_handler.php', { method: 'POST', body: fd });
        const data = await response.json();

        if (data.status === 'success') {
          alertBox.className = 'auth-alert success';
          alertBox.textContent = data.message || 'Login verification successful!';
          alertBox.style.display = 'block';
          setTimeout(() => { location.href = 'index.html'; }, 1200);
        } else {
          alertBox.className = 'auth-alert error';
          alertBox.textContent = data.message || 'Invalid username or password.';
          alertBox.style.display = 'block';
        }
      } catch (err) {
        alertBox.className = 'auth-alert error';
        alertBox.textContent = 'Server communications issue. Please retry.';
        alertBox.style.display = 'block';
      }
    });
  }

  // Process Registration
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPass').value;
      const confirm = document.getElementById('signupConfirm').value;
      const alertBox = document.getElementById('signupAlert');

      if (password !== confirm) {
        alertBox.className = 'auth-alert error';
        alertBox.textContent = 'Passwords do not match.';
        alertBox.style.display = 'block';
        return;
      }

      const fd = new FormData();
      fd.append('action', 'register');
      fd.append('name', name);
      fd.append('email', email);
      fd.append('password', password);

      try {
        const response = await fetch('auth_handler.php', { method: 'POST', body: fd });
        const data = await response.json();

        if (data.status === 'success') {
          alertBox.className = 'auth-alert success';
          alertBox.textContent = data.message || 'Profile configured successfully!';
          alertBox.style.display = 'block';
          setTimeout(() => { location.href = 'index.html'; }, 1200);
        } else {
          alertBox.className = 'auth-alert error';
          alertBox.textContent = data.message || 'Registration rejected.';
          alertBox.style.display = 'block';
        }
      } catch (err) {
        alertBox.className = 'auth-alert error';
        alertBox.textContent = 'Server processing failure.';
        alertBox.style.display = 'block';
      }
    });
  }
}

// ── Contact Inquiry Submission Logic ────────
function initInquiryFormProcessing() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Bind field targets to the database parameters expected by inquiry_handler.php
    const destEl = document.getElementById('inquiryDestination');
    const subjEl = document.getElementById('inquirySubject');
    const msgEl = document.getElementById('inquiryMessage');
    const successMsg = document.getElementById('formSuccess');

    let isFormValid = true;
    [destEl, subjEl, msgEl].forEach(element => {
      if (!element) return;
      const errLabel = element.parentElement.querySelector('.form-error');
      if (!element.value.trim()) {
        if (errLabel) errLabel.style.display = 'block';
        element.style.borderColor = 'var(--coral)';
        isFormValid = false;
      } else {
        if (errLabel) errLabel.style.display = 'none';
        element.style.borderColor = '';
      }
    });

    if (!isFormValid) {
      showToast('Please correct the highlighted form errors.', 'error');
      return;
    }

    const fd = new FormData();
    fd.append('destination', destEl.value);
    fd.append('subject', subjEl.value.trim());
    fd.append('message', msgEl.value.trim());

    try {
      const response = await fetch('inquiry_handler.php', { method: 'POST', body: fd });
      
      if (response.status === 401) {
        showToast('Your session has expired. Please log in again.', 'error');
        return;
      }

      const data = await response.json();

      if (data.status === 'success') {
        if (successMsg) {
          successMsg.textContent = data.message || 'Inquiry successfully transmitted.';
          successMsg.style.display = 'block';
        }
        form.reset();
        showToast('Inquiry filed safely!', 'success');
        setTimeout(() => { if (successMsg) successMsg.style.display = 'none'; }, 5000);
      } else {
        showToast(data.message || 'Submission was rejected by server.', 'error');
      }
    } catch (err) {
      showToast('Network transaction drop occurred.', 'error');
    }
  });
}

// ── Original Visual Components (Preserved) ──
function initSlider() {
  const slider = document.getElementById('destSlider');
  const dotsContainer = document.getElementById('sliderDots');
  if (!slider || !dotsContainer) return;

  const cards = slider.querySelectorAll('.dest-card');
  dotsContainer.innerHTML = '';
  cards.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    });
    dotsContainer.appendChild(d);
  });

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

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

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
        card.style.display = (filter === 'all' || tag === filter) ? '' : 'none';
      });
    });
  });
}

function showToast(msg, type = 'success') {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = `toast ${type}`;
  requestAnimationFrame(() => { t.classList.add('show'); });
  setTimeout(() => { t.classList.remove('show'); }, 3400);
}

// ── Application Bootloader Lifecycle ────────
document.addEventListener('DOMContentLoaded', async () => {
  // Sync context with PHP backend immediately on page load
  await syncAuthState();
  
  initNavbar();
  initSlider();
  initFilter();
  initAuthFormProcessing();
  initInquiryFormProcessing();

  document.querySelectorAll('.intro-text, .intro-map, .dest-full-card, .exp-card, .contact-info, .contact-form').forEach(el => {
    el.classList.add('reveal');
  });
  initReveal();
});