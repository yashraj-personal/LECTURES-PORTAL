const Auth = (() => {
  const isAdmin = () => sessionStorage.getItem('lectureHubAdmin') === 'true';
  const ADMIN_REDIRECT_URL = 'https://yashraj-personal.github.io/login/';
  // Visitor access is intentionally local so the public portal still opens if Apps Script is down.
  // This is a convenience gate, not secure authentication: static-site source is visible to visitors.
  const SITE_ACCESS_PASSWORD = 'NOTES';

  const ADMIN_LOOP_SOUND = 'assets/chatbot-sounds/WHEN USER CLICKS ADMIN PANEL BUTTON [SHOULD RUN IN LOOP UNTIL USER RETURNS].mp3';
  const ADMIN_ALERT_SOUND = 'assets/admin-alert.mp3';
  // The admin-panel sound loops from the confirmation page until the visitor returns or logs in.
  const getAlertAudio = () => {
    let audio = document.getElementById('admin-alert-sound');
    if (!audio) { audio = document.createElement('audio'); audio.id = 'admin-alert-sound'; audio.src = encodeURI(ADMIN_LOOP_SOUND); audio.preload = 'auto'; document.body.appendChild(audio); }
    return audio;
  };
  const playAdminAlertLoop = () => {
    if (typeof window.SoundFX?.startLoop === 'function') { window.SoundFX.startLoop('adminLoop', true); return; }
    const audio = getAlertAudio(); audio.loop = true; audio.play().catch(() => {});
  };
  const stopAdminAlert = () => {
    if (typeof window.SoundFX?.stop === 'function') { window.SoundFX.stop('adminLoop'); return; }
    const audio = document.getElementById('admin-alert-sound');
    if (audio) { audio.loop = false; audio.pause(); audio.currentTime = 0; }
  };
  const playWrongAdminPasswordAlert = () => {
    if (typeof window.SoundFX?.play === 'function') { window.SoundFX.play('adminAlert', true); return; }
    const audio = new Audio(encodeURI(ADMIN_ALERT_SOUND));
    audio.preload = 'auto';
    audio.play().catch(() => {});
  };

  // Sub-page shown before the admin password gate: "this page is for admin only, are you sure?"
  const confirmAdmin = () => new Promise(resolve => {
    const wrap = document.createElement('section');
    wrap.className = 'access-gate gate-admin gate-confirm';
    wrap.innerHTML = `<div class="gate-grid"></div><div class="gate-card"><span class="gate-glyph">⚠</span><span class="eyebrow">RESTRICTED · ADMIN ONLY</span><h1>Admin access only.</h1><p>This page is just for the admin. Are you sure you want to log in?<br><small>(You will be solely responsible for your own actions — no one else can be blamed for what happens next.)</small></p><div class="confirm-actions"><button type="button" class="button primary" id="confirm-yes">YES, CONTINUE <b>↗</b></button><button type="button" class="button outline" id="confirm-no">NO, TAKE ME BACK</button></div></div>`;
    document.body.prepend(wrap);
    playAdminAlertLoop();
    wrap.querySelector('#confirm-yes').onclick = () => {
      playAdminAlertLoop();
      wrap.classList.add('leaving');
      setTimeout(() => { wrap.remove(); resolve(true); }, 620);
    };
    wrap.querySelector('#confirm-no').onclick = () => { stopAdminAlert(); window.location.href = 'index.html'; };
  });

  const gate = async (admin = false) => {
    if ((!admin && sessionStorage.getItem('lectureHubAccess') === 'true') || (admin && isAdmin())) return true;
    return new Promise(resolve => {
      const gate = document.createElement('section'); gate.className = admin ? 'access-gate gate-admin' : 'access-gate';
      gate.innerHTML = admin
        ? `<div class="gate-grid"></div><form class="gate-card"><span class="gate-glyph">⌘</span><span class="eyebrow">RESTRICTED · ADMIN ONLY</span><h1>Control the archive.</h1><p>Sign in using the administrator credentials provided by the portal.</p><label>Admin password <span><input autocomplete="current-password" type="password" required placeholder="••••••••"><button type="button" class="show-password" aria-label="Show password">◉</button></span></label><button class="button primary" type="submit">AUTHENTICATE <b>↗</b></button><small class="gate-status">Every attempt is verified and recorded.</small><a class="button gate-redirect" href="${ADMIN_REDIRECT_URL}">SECRET SETTINGS <b>↗</b></a></form>`
        : `<div class="gate-orb orb-a"></div><div class="gate-orb orb-b"></div><form class="gate-card"><span class="eyebrow">PRIVATE LECTURE PORTAL</span><h1>Authorized access only.</h1><p>Everything you need to learn, beautifully organized.</p><label>Password <span><input autocomplete="current-password" type="password" required placeholder="Enter your password"><button type="button" class="show-password" aria-label="Show password">◉</button></span></label><button class="button primary" type="submit">ENTER PORTAL <b>↗</b></button><small class="gate-status">Secure connection required</small></form>`;
      document.body.prepend(gate);
      const input = gate.querySelector('input'), status = gate.querySelector('.gate-status');
      gate.querySelector('.show-password').onclick = () => input.type = input.type === 'password' ? 'text' : 'password';
      gate.querySelector('form').onsubmit = async e => {
        e.preventDefault();
        status.textContent = 'VERIFYING ACCESS…';
        try {
          const r = admin ? await API.login(input.value, true) : null;
          const ok = admin
            ? (r?.success === true || r?.authenticated === true || r?.status === 'success' || r?.valid === true)
            : input.value.trim().toUpperCase() === SITE_ACCESS_PASSWORD;
          if (!ok) throw Error();
          if (admin) stopAdminAlert();
          window.SoundFX?.play('loginSuccess');
          sessionStorage.setItem(admin ? 'lectureHubAdmin' : 'lectureHubAccess', 'true');
          status.textContent = '✓ ACCESS GRANTED';
          API.log(admin ? 'ADMIN_LOGIN_SUCCESS' : 'LOGIN_SUCCESS');
          gate.classList.add('leaving');
          setTimeout(() => { gate.remove(); if (!admin) window.dispatchEvent(new Event('lecturehub:login-success')); resolve(true); }, 620);
        } catch {
          status.textContent = 'ACCESS DENIED';
          input.value = '';
          // A wrong visitor password uses the regular failure effect. A wrong
          // admin password additionally plays the dedicated admin alert asset.
          window.SoundFX?.play('loginFailure');
          API.log(admin ? 'ADMIN_LOGIN_FAILED' : 'LOGIN_FAILED');
          if (admin) { playWrongAdminPasswordAlert(); playAdminAlertLoop(); }
        }
      };
    });
  };
  return { gate, isAdmin, confirmAdmin };
})();
