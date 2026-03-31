const IS_DEV = window.location.hostname === 'localhost';
const API_URL = IS_DEV ? '/api' : 'https://foote.onrender.com/api';

function getToken() {
  return localStorage.getItem('token');
}

function getHeaders(auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Erro na requisicao');
  }
  return res.json();
}

// ─── Auth ───
export const loginGoogle = async (credential) => {
  const data = await request('/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};
export const getMe = () => request('/auth/me', { headers: getHeaders() });
export const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); };
export const getStoredUser = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
export const isLoggedIn = () => !!getToken();

// ─── Grupos ───
export const getGrupos = () => request('/grupos', { headers: getHeaders(false) });
export const getGrupo = (id) => request(`/grupos/${id}`, { headers: getHeaders(false) });
export const criarGrupo = (data) => request('/grupos', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
export const entrarGrupo = (grupoId, data) => request(`/grupos/${grupoId}/entrar`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
export const getMeuRole = (grupoId) => request(`/grupos/${grupoId}/meu-role`, { headers: getHeaders() });

// ─── Membros / Elenco ───
export const getMembros = (grupoId) => request(`/grupos/${grupoId}/membros`, { headers: getHeaders(false) });
export const getMembroPerfil = (grupoId, membroId) => request(`/grupos/${grupoId}/membros/${membroId}`, { headers: getHeaders(false) });

// ─── Rachas ───
export const getRachas = (grupoId) => request(`/grupos/${grupoId}/rachas`, { headers: getHeaders(false) });
export const getRacha = (grupoId, rachaId) => request(`/grupos/${grupoId}/rachas/${rachaId}`, { headers: getHeaders(false) });
export const criarRacha = (grupoId, data) => request(`/grupos/${grupoId}/rachas`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
export const confirmarPresenca = (grupoId, rachaId) => request(`/grupos/${grupoId}/rachas/${rachaId}/confirmar`, { method: 'POST', headers: getHeaders() });
export const cancelarPresenca = (grupoId, rachaId) => request(`/grupos/${grupoId}/rachas/${rachaId}/sair`, { method: 'POST', headers: getHeaders() });
export const getPagamentoStatus = (grupoId, rachaId) => request(`/grupos/${grupoId}/rachas/${rachaId}/pagamento-status`, { headers: getHeaders() });

// Mercado Pago OAuth
export const getMpOAuthUrl = (grupoId) => request(`/mp-oauth/connect/${grupoId}`, { headers: getHeaders() });
export const getMpStatus = (grupoId) => request(`/mp-oauth/status/${grupoId}`, { headers: getHeaders(false) });
export const disconnectMp = (grupoId) => request(`/mp-oauth/disconnect/${grupoId}`, { method: 'POST', headers: getHeaders() });

// ─── Caixinha ───
export const getCaixinha = (grupoId) => request(`/grupos/${grupoId}/caixinha`, { headers: getHeaders(false) });
