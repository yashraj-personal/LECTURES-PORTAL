/* Static-site Apps Script client: no browser-visible API secret. */
const API_URL = 'https://script.google.com/macros/s/AKfycbycDCNGxJYmor8HMpOygH-z68zaCUdq4MCW11Utr3QQd9VDSaK8xYWTgCQ8RUESrb34ew/exec';
const API = (() => {
  const visitorId = (() => { const key = 'lectureHubVisitor'; let id = sessionStorage.getItem(key); if (!id) { id = crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(16).slice(2)}`; sessionStorage.setItem(key, id); } return id; })();
  async function request(action, data = {}, method = 'GET') {
    let url = API_URL; const options = { method, redirect: 'follow' };
    if (method === 'GET') url += `?${new URLSearchParams({ action, ...data })}`;
    else { options.headers = { 'Content-Type': 'text/plain;charset=utf-8' }; options.body = JSON.stringify({ action, visitorId, userAgent: navigator.userAgent, ...data }); }
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Connection failed (${response.status})`);
    const payload = await response.json();
    if (payload?.success === false) throw new Error(payload.error || 'Apps Script rejected the request');
    return payload;
  }
  return {
    visitorId, request,
    async lectures(module) { return (await request('lectures', { module })).lectures || []; },
    async allLectures() { return Object.values((await request('allLectures')).modules || {}).flat(); },
    async settings() { return (await request('settings')).settings || {}; },
    async quizzes() { return (await request('quizzes')).quizzes || []; },
    async stats() {
      const stats = await request('stats');
      return { ...stats, uniqueVisitors: stats.todayUniqueVisitors, successfulLogins: stats.totalSuccessfulLogins };
    },
    async logs(limit = 50) { return (await request('logs', { limit })).logs || []; },
    login(password, admin = false) { return request(admin ? 'adminLogin' : 'login', { password }, 'POST'); },
    log(event, details = '', page = location.pathname) { return request('log', { event, page, status: 'SUCCESS', details }, 'POST').catch(() => null); },
    visit() { return request('visit', {}, 'POST').catch(() => null); },
    updateSettings(updates) { return request('updateSettings', { updates }, 'POST'); }
  };
})();
