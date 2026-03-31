const { Router } = require('express');
const { getDb } = require('../db/schema');
const { requireAuth, requireGroupAdmin } = require('../middleware/auth');

const router = Router();
const MP_APP_ID = process.env.MP_APP_ID;
const MP_CLIENT_SECRET = process.env.MP_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

router.get('/connect/:grupoId', requireAuth, requireGroupAdmin, (req, res) => {
  if (!MP_APP_ID) return res.status(500).json({ error: 'MP_APP_ID nao configurado' });
  const redirectUri = `${BACKEND_URL}/api/mp-oauth/callback`;
  const state = `${req.params.grupoId}:${req.user.id}`;
  const url = `https://auth.mercadopago.com.br/authorization?client_id=${MP_APP_ID}&response_type=code&platform_id=mp&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.json({ url });
});

router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.redirect(`${process.env.FRONTEND_URL}?mp_error=missing_params`);
    const [grupoId] = state.split(':');

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_secret: MP_CLIENT_SECRET, client_id: MP_APP_ID,
        grant_type: 'authorization_code', code,
        redirect_uri: `${BACKEND_URL}/api/mp-oauth/callback`,
      }),
    });
    const data = await response.json();
    if (!data.access_token) {
      console.error('[MP-OAUTH] Erro:', data);
      return res.redirect(`${process.env.FRONTEND_URL}/g/${grupoId}?mp_error=token_failed`);
    }

    const db = getDb();
    await db.prepare("UPDATE grupos SET mp_access_token = $1, mp_refresh_token = $2, mp_user_id = $3, mp_connected_at = NOW() WHERE id = $4")
      .run(data.access_token, data.refresh_token || null, String(data.user_id || ''), Number(grupoId));
    console.log(`[MP-OAUTH] Grupo ${grupoId} conectado (user_id: ${data.user_id})`);
    res.redirect(`${process.env.FRONTEND_URL}/g/${grupoId}?mp_connected=true`);
  } catch (error) {
    console.error('[MP-OAUTH] Erro:', error.message);
    res.redirect(`${process.env.FRONTEND_URL}?mp_error=server_error`);
  }
});

router.get('/status/:grupoId', async (req, res) => {
  const db = getDb();
  const grupo = await db.prepare('SELECT mp_access_token, mp_user_id, mp_connected_at FROM grupos WHERE id = $1').get(Number(req.params.grupoId));
  if (!grupo) return res.status(404).json({ error: 'Grupo nao encontrado' });
  res.json({ connected: !!grupo.mp_access_token, mp_user_id: grupo.mp_user_id || null, connected_at: grupo.mp_connected_at || null });
});

router.post('/disconnect/:grupoId', requireAuth, requireGroupAdmin, async (req, res) => {
  const db = getDb();
  await db.prepare('UPDATE grupos SET mp_access_token = NULL, mp_refresh_token = NULL, mp_user_id = NULL, mp_connected_at = NULL WHERE id = $1')
    .run(Number(req.params.grupoId));
  res.json({ message: 'Mercado Pago desconectado' });
});

module.exports = router;
