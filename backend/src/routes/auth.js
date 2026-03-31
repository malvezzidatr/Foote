const { Router } = require('express');
const { OAuth2Client } = require('google-auth-library');
const { getDb } = require('../db/schema');
const { generateToken, requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'credential obrigatorio' });
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: 'GOOGLE_CLIENT_ID nao configurado' });

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const db = getDb();
    let usuario = await db.prepare('SELECT * FROM usuarios WHERE google_id = $1').get(googleId);
    if (!usuario) {
      await db.prepare('INSERT INTO usuarios (google_id, nome, email, foto) VALUES ($1, $2, $3, $4)').run(googleId, name, email, picture || null);
    } else {
      await db.prepare('UPDATE usuarios SET nome = $1, email = $2, foto = $3 WHERE id = $4').run(name, email, picture || null, usuario.id);
    }
    usuario = await db.prepare('SELECT * FROM usuarios WHERE google_id = $1').get(googleId);

    const token = generateToken(usuario);
    res.json({ token, user: { id: usuario.id, nome: usuario.nome, email: usuario.email, foto: usuario.foto } });
  } catch (error) {
    console.error('[AUTH] Erro Google:', error.message);
    res.status(401).json({ error: 'Token Google invalido' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const db = getDb();
  const usuario = await db.prepare('SELECT id, nome, email, foto FROM usuarios WHERE id = $1').get(req.user.id);
  if (!usuario) return res.status(404).json({ error: 'Usuario nao encontrado' });
  const grupos = await db.prepare(`
    SELECT g.*, m.role, m.apelido, m.posicao FROM membros m JOIN grupos g ON g.id = m.grupo_id
    WHERE m.usuario_id = $1 AND m.ativo = 1
  `).all(req.user.id);
  res.json({ ...usuario, grupos });
});

module.exports = router;
