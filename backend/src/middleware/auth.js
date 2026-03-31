const jwt = require('jsonwebtoken');
const { getDb } = require('../db/schema');

const JWT_SECRET = process.env.JWT_SECRET || 'racha-fc-secret-change-me';

function generateToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, nome: usuario.nome, foto: usuario.foto },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Token nao fornecido' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido' });
  }
}

async function requireGroupAdmin(req, res, next) {
  const db = getDb();
  const grupoId = req.params.grupoId || req.body.grupo_id;
  if (!grupoId) return res.status(400).json({ error: 'grupo_id obrigatorio' });
  const membro = await db.prepare('SELECT * FROM membros WHERE grupo_id = $1 AND usuario_id = $2 AND role = $3')
    .get(Number(grupoId), req.user.id, 'admin');
  if (!membro) return res.status(403).json({ error: 'Voce nao e admin deste grupo' });
  req.membro = membro;
  next();
}

async function requireGroupMember(req, res, next) {
  const db = getDb();
  const grupoId = req.params.grupoId || req.body.grupo_id;
  if (!grupoId) return res.status(400).json({ error: 'grupo_id obrigatorio' });
  const membro = await db.prepare('SELECT * FROM membros WHERE grupo_id = $1 AND usuario_id = $2 AND ativo = 1')
    .get(Number(grupoId), req.user.id);
  if (!membro) return res.status(403).json({ error: 'Voce nao e membro deste grupo' });
  req.membro = membro;
  next();
}

module.exports = { generateToken, requireAuth, requireGroupAdmin, requireGroupMember, JWT_SECRET };
