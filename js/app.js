/* ==============================================
   BANKING APP – FRONTEND JAVASCRIPT
   Calls Node.js/Express backend API for OTP
   ============================================== */

'use strict';

/* ── Utility helpers ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');
const animateIn = el => { el.classList.remove('animate-in'); void el.offsetWidth; el.classList.add('animate-in'); };

/* ── Session storage (user info only – OTP lives on server) ── */
const USER_KEY = 'bank_user';
const AUTH_KEY = 'bank_authed';

function setUser(u) { sessionStorage.setItem(USER_KEY, JSON.stringify(u)); }
function getUser() {
  try { return JSON.parse(sessionStorage.getItem(USER_KEY)) || {}; }
  catch { return {}; }
}
function isAuthed() { return sessionStorage.getItem(AUTH_KEY) === '1'; }
function setAuthed() { sessionStorage.setItem(AUTH_KEY, '1'); }
function logout() { sessionStorage.clear(); window.location.href = 'index.html'; }

/* ── Toast notifications ── */
function toast(msg, type = 'info', duration = 4500) {
  let container = $('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed', bottom: '24px', right: '24px',
      display: 'flex', flexDirection: 'column', gap: '10px', zIndex: '9999'
    });
    document.body.appendChild(container);
  }
  const colors = { info: '#1565C0', success: '#2E7D32', error: '#C62828', warn: '#E65100' };
  const t = document.createElement('div');
  Object.assign(t.style, {
    background: '#fff', borderLeft: `4px solid ${colors[type] || colors.info}`,
    padding: '14px 20px', borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,.18)',
    fontSize: '14px', color: '#212121', maxWidth: '360px',
    opacity: '0', transform: 'translateX(20px)', transition: 'all .3s ease',
    fontFamily: 'Inter, sans-serif', lineHeight: '1.5'
  });
  t.textContent = msg;
  container.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'none'; });
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(20px)';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

/* =================================================
   PAGE: SIGNUP (signup.html)
   ================================================= */
function initSignup() {
  const form       = $('#signup-form');
  if (!form) return;

  const firstName  = $('#first-name');
  const lastName   = $('#last-name');
  const emailInp   = $('#email');
  const verifyBtn  = $('#verify-btn');
  const otpSection = $('#otp-section');
  const msgBox     = $('#otp-msg');
  const otpInputs  = $$('.otp-digit');
  const submitBtn  = $('#submit-otp');
  const steps      = $$('.step-dot');

  let userEmail = ''; // track which email the OTP was sent for

  /* Show Verify button once email looks valid */
  emailInp.addEventListener('input', () => {
    const valid = emailInp.value.trim().length > 5 && emailInp.value.includes('@');
    valid ? show(verifyBtn) : hide(verifyBtn);
    if (valid) verifyBtn.classList.add('animate-in');
  });

  /* ── VERIFY CLICK → call /api/send-otp ── */
  verifyBtn.addEventListener('click', async () => {
    if (!validateSignupForm()) return;

    const user = {
      firstName: firstName.value.trim(),
      lastName:  lastName.value.trim(),
      email:     emailInp.value.trim()
    };
    userEmail = user.email;
    setUser(user);

    // UI feedback
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span> Sending OTP…';

    try {
      const res  = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error('Server returned an unexpected response format. Please check your environment variables on Render.');
      }

      if (!res.ok || !data.success) throw new Error(data.error || 'Server error');

      // Success
      steps[0].classList.remove('active'); steps[0].classList.add('done');
      steps[1].classList.add('active');

      show(otpSection);
      animateIn(otpSection);

      msgBox.innerHTML = `
        <div class="alert alert-info fade-in">
          <span>📨</span>
          <div>
            <strong>OTP sent to the site owner!</strong><br/>
            Please contact the bank administrator or site owner
            and ask for your OTP. Enter it below once received.
          </div>
        </div>`;

      [firstName, lastName, emailInp].forEach(el => el.disabled = true);
      verifyBtn.innerHTML = '✓ OTP Sent';
      toast('OTP sent to site owner! Contact them for your code.', 'success', 6000);
      otpInputs[0]?.focus();

    } catch (err) {
      console.error('send-otp error:', err);
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = '📧 Verify Email &amp; Send OTP';
      msgBox.innerHTML = `
        <div class="alert alert-error fade-in">
          <span>⚠️</span>
          <div><strong>Could not send OTP email.</strong> ${err.message || 'Please try again.'}</div>
        </div>`;
      toast('Failed to send OTP. Please try again.', 'error');
    }
  });

  /* ── OTP inputs: auto-advance + paste ── */
  otpInputs.forEach((inp, i) => {
    inp.addEventListener('input', e => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val.slice(0, 1);
      if (val && i < otpInputs.length - 1) otpInputs[i + 1].focus();
      checkSubmitReady();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !e.target.value && i > 0) {
        otpInputs[i - 1].focus();
        otpInputs[i - 1].value = '';
      }
    });
    inp.addEventListener('paste', e => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      pasted.split('').forEach((ch, j) => { if (otpInputs[j]) otpInputs[j].value = ch; });
      otpInputs[Math.min(pasted.length, otpInputs.length - 1)]?.focus();
      checkSubmitReady();
    });
  });

  function checkSubmitReady() {
    submitBtn.disabled = !otpInputs.every(i => i.value !== '');
  }

  /* ── SUBMIT OTP → call /api/verify-otp ── */
  submitBtn.addEventListener('click', async () => {
    const entered = otpInputs.map(i => i.value).join('');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying…';

    try {
      const res  = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: entered })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // ✅ Success
        steps[1].classList.remove('active'); steps[1].classList.add('done');
        steps[2].classList.add('active');

        msgBox.innerHTML = `
          <div class="alert alert-success fade-in">
            <span>✅</span>
            <div><strong>OTP Verified!</strong> Welcome aboard. Redirecting to dashboard…</div>
          </div>`;

        submitBtn.textContent = '✓ Verified!';
        setAuthed();
        toast('Welcome! Redirecting to your dashboard…', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1800);

      } else {
        // ❌ Wrong OTP
        const errMsg = data.error || 'Invalid OTP';
        msgBox.innerHTML = `
          <div class="alert alert-error fade-in">
            <span>❌</span>
            <div><strong>${errMsg}</strong> Please check with the site owner and try again.</div>
          </div>`;

        otpInputs.forEach(i => {
          i.value = '';
          i.classList.add('error');
          setTimeout(() => i.classList.remove('error'), 1000);
        });
        otpInputs[0].focus();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit OTP & Verify Account';
        toast(errMsg, 'error');
      }
    } catch (err) {
      console.error('verify-otp error:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit OTP & Verify Account';
      toast('Network error. Please try again.', 'error');
    }
  });

  /* ── Form validation ── */
  function validateSignupForm() {
    let valid = true;
    [firstName, lastName, emailInp].forEach(inp => inp.classList.remove('error'));
    if (!firstName.value.trim()) {
      firstName.classList.add('error'); firstName.focus();
      toast('Please enter your first name.', 'error'); valid = false;
    } else if (!lastName.value.trim()) {
      lastName.classList.add('error'); lastName.focus();
      toast('Please enter your last name.', 'error'); valid = false;
    } else if (!emailInp.value.includes('@') || emailInp.value.trim().length < 6) {
      emailInp.classList.add('error'); emailInp.focus();
      toast('Please enter a valid email address.', 'error'); valid = false;
    }
    return valid;
  }
}

/* =================================================
   PAGE: DASHBOARD (dashboard.html)
   ================================================= */
function initDashboard() {
  if (!isAuthed()) { window.location.href = 'index.html'; return; }

  const user    = getUser();
  const nameEl  = $('#user-name');
  const greetEl = $('#dash-greet');

  if (nameEl) nameEl.textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Valued Customer';
  if (greetEl) {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    greetEl.textContent = `${g}, ${user.firstName || 'Customer'}`;
  }

  $$('.signout-btn').forEach(btn => btn.addEventListener('click', logout));

  $$('.dash-subnav a').forEach(a => {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      $$('.dash-subnav a').forEach(x => x.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* Dashboard "Get Started" button – change URL as needed */
  const gsBtn = $('#get-started-btn');
  gsBtn?.addEventListener('click', () => window.open('https://www.wellsfargo.com', '_blank'));

  toast(`Welcome back, ${user.firstName || 'Customer'}!`, 'success');
}

/* ── CSS for spinner used in verify button ── */
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

/* ── Page detector ── */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'signup')    initSignup();
  if (page === 'dashboard') initDashboard();
});
