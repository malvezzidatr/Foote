const { Router } = require('express');
const { getDb } = require('../db/schema');
const { requireAuth, requireGroupAdmin, requireGroupMember } = require('../middleware/auth');
const { criarPagamentoPix } = require('../services/mercadopago');
const { sortearTimes } = require('../services/sorteio');

const router = Router();

// GET /api/grupos
router.get('/', async (req, res) => {
  const db = getDb();
  const grupos = await db.prepare(`
    SELECT g.*,
      (SELECT COUNT(*) FROM membros m WHERE m.grupo_id = g.id AND m.ativo = 1) as membros,
      (SELECT r.data FROM rachas r WHERE r.grupo_id = g.id AND r.status = 'aberto' ORDER BY r.data ASC LIMIT 1) as proximo_racha
    FROM grupos g ORDER BY g.created_at DESC
  `).all();
  res.json(grupos);
});

// GET /api/grupos/:grupoId
router.get('/:grupoId', async (req, res) => {
  const db = getDb();
  const grupo = await db.prepare('SELECT * FROM grupos WHERE id = $1').get(Number(req.params.grupoId));
  if (!grupo) return res.status(404).json({ error: 'Grupo nao encontrado' });
  const membros = await db.prepare(`
    SELECT m.id as membro_id, m.role, m.posicao, m.apelido, m.ativo, u.id as usuario_id, u.nome, u.email, u.foto
    FROM membros m JOIN usuarios u ON u.id = m.usuario_id
    WHERE m.grupo_id = $1 AND m.ativo = 1 ORDER BY m.role DESC, u.nome
  `).all(Number(req.params.grupoId));
  res.json({ ...grupo, membros, total_membros: membros.length });
});

// POST /api/grupos
router.post('/', requireAuth, async (req, res) => {
  const db = getDb();
  const { nome, descricao, local_padrao, valor_padrao, cor } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome obrigatorio' });
  const result = await db.prepare(
    'INSERT INTO grupos (nome, descricao, local_padrao, valor_padrao, cor) VALUES ($1, $2, $3, $4, $5) RETURNING *'
  ).get(nome, descricao || null, local_padrao || null, valor_padrao || 20, cor || 'lime');
  await db.prepare('INSERT INTO membros (grupo_id, usuario_id, role) VALUES ($1, $2, $3)').run(result.id, req.user.id, 'admin');
  res.status(201).json(result);
});

// POST /api/grupos/:grupoId/entrar
router.post('/:grupoId/entrar', requireAuth, async (req, res) => {
  const db = getDb();
  const grupoId = Number(req.params.grupoId);
  const grupo = await db.prepare('SELECT * FROM grupos WHERE id = $1').get(grupoId);
  if (!grupo) return res.status(404).json({ error: 'Grupo nao encontrado' });
  const existing = await db.prepare('SELECT * FROM membros WHERE grupo_id = $1 AND usuario_id = $2').get(grupoId, req.user.id);
  if (existing) {
    if (existing.ativo) return res.status(400).json({ error: 'Voce ja e membro' });
    await db.prepare('UPDATE membros SET ativo = 1 WHERE id = $1').run(existing.id);
    return res.json({ message: 'Reentrou no grupo' });
  }
  const { apelido, posicao } = req.body;
  await db.prepare('INSERT INTO membros (grupo_id, usuario_id, role, apelido, posicao) VALUES ($1, $2, $3, $4, $5)')
    .run(grupoId, req.user.id, 'membro', apelido || null, posicao || 'Meia');
  res.status(201).json({ message: 'Entrou no grupo' });
});

// GET /api/grupos/:grupoId/meu-role
router.get('/:grupoId/meu-role', requireAuth, async (req, res) => {
  const db = getDb();
  const membro = await db.prepare('SELECT id, role FROM membros WHERE grupo_id = $1 AND usuario_id = $2 AND ativo = 1')
    .get(Number(req.params.grupoId), req.user.id);
  let penalizado = false;
  if (membro) {
    penalizado = (await db.prepare('SELECT COUNT(*) as total FROM penalidades WHERE membro_id = $1 AND ativa = 1').get(membro.id)).total > 0;
  }
  res.json({ role: membro?.role || null, membro_id: membro?.id || null, penalizado });
});

// ─── MEMBROS ───
router.get('/:grupoId/membros', async (req, res) => {
  const db = getDb();
  const grupoId = Number(req.params.grupoId);
  const membros = await db.prepare(`
    Select m.id as membro_id, m.role, m.posicao, m.apelido, m.nota, m.ativo, u.id as usuario_id, u.nome, u.email, u.foto
    FROM membros m JOIN usuarios u ON u.id = m.usuario_id WHERE m.grupo_id = $1 AND m.ativo = 1 ORDER BY u.nome
  `).all(grupoId);

  const result = [];
  for (const m of membros) {
    const gols = (await db.prepare('SELECT COALESCE(SUM(gols), 0) as total FROM estatisticas WHERE membro_id = $1').get(m.membro_id)).total;
    const assistencias = (await db.prepare('SELECT COALESCE(SUM(assistencias), 0) as total FROM estatisticas WHERE membro_id = $1').get(m.membro_id)).total;
    const jogos = (await db.prepare("SELECT COUNT(*) as total FROM confirmacoes WHERE membro_id = $1 AND status = 'pago'").get(m.membro_id)).total;
    const penalidade_ativa = (await db.prepare('SELECT COUNT(*) as total FROM penalidades WHERE membro_id = $1 AND ativa = 1').get(m.membro_id)).total > 0;
    result.push({ ...m, gols: Number(gols), assistencias: Number(assistencias), jogos: Number(jogos), penalidade_ativa });
  }
  res.json(result);
});

// PATCH /api/grupos/:grupoId/membros/:membroId/nota
router.patch('/:grupoId/membros/:membroId/nota', requireAuth, requireGroupAdmin, async (req, res) => {
  const db = getDb();
  const grupoId = Number(req.params.grupoId);
  const membroId = Number(req.params.membroId);
  const { nota } = req.body;
  if (nota == null || nota < 1 || nota > 10) return res.status(400).json({ error: 'Nota deve ser entre 1 e 10' });
  const membro = await db.prepare('SELECT * FROM membros WHERE id = $1 AND grupo_id = $2').get(membroId, grupoId);
  if (!membro) return res.status(404).json({ error: 'Membro nao encontrado' });
  await db.prepare('UPDATE membros SET nota = $1 WHERE id = $2').run(nota, membroId);
  res.json({ message: 'Nota atualizada', nota });
});

// GET /api/grupos/:grupoId/membros/:membroId
router.get('/:grupoId/membros/:membroId', async (req, res) => {
  const db = getDb();
  const grupoId = Number(req.params.grupoId);
  const membroId = Number(req.params.membroId);
  const membro = await db.prepare(`
    SELECT m.id as membro_id, m.role, m.posicao, m.apelido, m.nota, u.id as usuario_id, u.nome, u.email, u.foto
    FROM membros m JOIN usuarios u ON u.id = m.usuario_id WHERE m.id = $1 AND m.grupo_id = $2
  `).get(membroId, grupoId);
  if (!membro) return res.status(404).json({ error: 'Membro nao encontrado' });

  const gols = Number((await db.prepare('SELECT COALESCE(SUM(gols), 0) as total FROM estatisticas WHERE membro_id = $1').get(membroId)).total);
  const assistencias = Number((await db.prepare('SELECT COALESCE(SUM(assistencias), 0) as total FROM estatisticas WHERE membro_id = $1').get(membroId)).total);
  const jogos = Number((await db.prepare("SELECT COUNT(*) as total FROM confirmacoes WHERE membro_id = $1 AND status = 'pago'").get(membroId)).total);
  const calotes = Number((await db.prepare("SELECT COUNT(*) as total FROM confirmacoes WHERE membro_id = $1 AND status = 'calote'").get(membroId)).total);
  const penalidades = await db.prepare('SELECT * FROM penalidades WHERE membro_id = $1 ORDER BY created_at DESC').all(membroId);
  const media_gols = jogos > 0 ? (gols / jogos).toFixed(1) : '0.0';
  const ultimo_jogo = await db.prepare(`
    SELECT r.data FROM confirmacoes c JOIN rachas r ON r.id = c.racha_id
    WHERE c.membro_id = $1 AND c.status = 'pago' AND r.status = 'finalizado' ORDER BY r.data DESC LIMIT 1
  `).get(membroId);
  const historico = await db.prepare(`
    SELECT r.id, r.data, r.local, r.status,
      (SELECT COUNT(*) FROM confirmacoes cc WHERE cc.racha_id = r.id AND cc.status = 'pago') as total_jogadores,
      COALESCE(e.gols, 0) as gols_racha, COALESCE(e.assistencias, 0) as assists_racha
    FROM confirmacoes c JOIN rachas r ON r.id = c.racha_id
    LEFT JOIN estatisticas e ON e.racha_id = r.id AND e.membro_id = c.membro_id
    WHERE c.membro_id = $1 AND c.status = 'pago' AND r.status = 'finalizado' ORDER BY r.data DESC
  `).all(membroId);

  res.json({
    ...membro, gols, assistencias, jogos, calotes, media_gols, penalidades,
    penalidade_ativa: penalidades.some(p => p.ativa), ultimo_jogo: ultimo_jogo?.data || null, historico,
  });
});

// POST /api/grupos/:grupoId/membros/:membroId/penalidade
router.post('/:grupoId/membros/:membroId/penalidade', requireAuth, requireGroupAdmin, async (req, res) => {
  const db = getDb();
  const grupoId = Number(req.params.grupoId);
  const membroId = Number(req.params.membroId);
  const { tipo, motivo, duracao, valor } = req.body;
  if (!tipo || !motivo) return res.status(400).json({ error: 'Tipo e motivo obrigatorios' });
  const membro = await db.prepare('SELECT * FROM membros WHERE id = $1 AND grupo_id = $2').get(membroId, grupoId);
  if (!membro) return res.status(404).json({ error: 'Membro nao encontrado' });
  const penalidade = await db.prepare(
    'INSERT INTO penalidades (grupo_id, membro_id, tipo, motivo, duracao, valor) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
  ).get(grupoId, membroId, tipo, motivo, duracao || null, valor || null);
  res.status(201).json(penalidade);
});

// ─── RACHAS ───
router.get('/:grupoId/rachas', async (req, res) => {
  const db = getDb();
  const grupoId = Number(req.params.grupoId);
  const rachas = await db.prepare('SELECT * FROM rachas WHERE grupo_id = $1 ORDER BY data DESC').all(grupoId);

  const result = [];
  for (const r of rachas) {
    const confirmados = await db.prepare(`
      SELECT c.id, c.membro_id, c.status, m.apelido, m.posicao, u.nome, u.foto
      FROM confirmacoes c JOIN membros m ON m.id = c.membro_id JOIN usuarios u ON u.id = m.usuario_id
      WHERE c.racha_id = $1 AND c.status = 'pago'
    `).all(r.id);
    const pendentes = await db.prepare(`
      SELECT c.id, c.membro_id, c.status, m.apelido, m.posicao, u.nome, u.foto
      FROM confirmacoes c JOIN membros m ON m.id = c.membro_id JOIN usuarios u ON u.id = m.usuario_id
      WHERE c.racha_id = $1 AND c.status = 'pendente'
    `).all(r.id);
    result.push({ ...r, confirmados, pendentes, total_confirmados: confirmados.length });
  }
  res.json(result);
});

// GET /api/grupos/:grupoId/rachas/:rachaId
router.get('/:grupoId/rachas/:rachaId', async (req, res) => {
  const db = getDb();
  const rachaId = Number(req.params.rachaId);
  const racha = await db.prepare('SELECT * FROM rachas WHERE id = $1 AND grupo_id = $2').get(rachaId, Number(req.params.grupoId));
  if (!racha) return res.status(404).json({ error: 'Racha nao encontrado' });

  const confirmados = await db.prepare(`
    SELECT c.id, c.membro_id, c.status, m.apelido, m.posicao, m.nota, u.nome, u.foto
    FROM confirmacoes c JOIN membros m ON m.id = c.membro_id JOIN usuarios u ON u.id = m.usuario_id
    WHERE c.racha_id = $1 AND c.status = 'pago'
  `).all(rachaId);
  const pendentes = await db.prepare(`
    SELECT c.id, c.membro_id, c.status, m.apelido, m.posicao, u.nome, u.foto
    FROM confirmacoes c JOIN membros m ON m.id = c.membro_id JOIN usuarios u ON u.id = m.usuario_id
    WHERE c.racha_id = $1 AND c.status = 'pendente'
  `).all(rachaId);
  const timesRows = await db.prepare(`
    SELECT t.time_numero, t.membro_id, m.apelido, m.posicao, m.nota, u.nome, u.foto
    FROM times t JOIN membros m ON m.id = t.membro_id JOIN usuarios u ON u.id = m.usuario_id
    WHERE t.racha_id = $1 ORDER BY t.time_numero
  `).all(rachaId);
  const estatisticas = await db.prepare(`
    SELECT e.*, m.apelido, m.posicao, u.nome, u.foto
    FROM estatisticas e JOIN membros m ON m.id = e.membro_id JOIN usuarios u ON u.id = m.usuario_id
    WHERE e.racha_id = $1 ORDER BY e.gols DESC
  `).all(rachaId);

  const timesAgrupados = timesRows.length > 0
    ? [1, 2, 3].map(num => ({ numero: num, jogadores: timesRows.filter(t => t.time_numero === num) })).filter(t => t.jogadores.length > 0)
    : null;

  res.json({ ...racha, confirmados, pendentes, total_confirmados: confirmados.length, times: timesAgrupados, estatisticas });
});

// POST /api/grupos/:grupoId/rachas
router.post('/:grupoId/rachas', requireAuth, requireGroupAdmin, async (req, res) => {
  const db = getDb();
  const grupoId = Number(req.params.grupoId);
  const { data, local, custo_campo } = req.body;
  if (!data) return res.status(400).json({ error: 'Data obrigatoria' });
  const grupo = await db.prepare('SELECT * FROM grupos WHERE id = $1').get(grupoId);
  const dataJogo = new Date(data);
  const prazo = new Date(dataJogo.getTime() - 24 * 60 * 60 * 1000);
  const racha = await db.prepare(
    'INSERT INTO rachas (grupo_id, data, local, custo_campo, valor_por_pessoa, prazo_pagamento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
  ).get(grupoId, data, local || grupo.local_padrao, custo_campo || null, grupo.valor_padrao, prazo.toISOString());
  res.status(201).json(racha);
});

// POST sortear times
router.post('/:grupoId/rachas/:rachaId/sortear', requireAuth, requireGroupAdmin, async (req, res) => {
  const db = getDb();
  const grupoId = Number(req.params.grupoId);
  const rachaId = Number(req.params.rachaId);

  const racha = await db.prepare('SELECT * FROM rachas WHERE id = $1 AND grupo_id = $2').get(rachaId, grupoId);
  if (!racha) return res.status(404).json({ error: 'Racha nao encontrado' });
  if (racha.status !== 'aberto') return res.status(400).json({ error: 'Racha nao esta aberto' });

  // Buscar confirmados pagos com nota
  const confirmados = await db.prepare(`
    SELECT c.membro_id, m.apelido, m.posicao, m.nota, u.nome
    FROM confirmacoes c JOIN membros m ON m.id = c.membro_id JOIN usuarios u ON u.id = m.usuario_id
    WHERE c.racha_id = $1 AND c.status = 'pago'
  `).all(rachaId);

  if (confirmados.length < 6) return res.status(400).json({ error: 'Minimo 6 jogadores para sortear' });

  // Limpar times anteriores
  await db.prepare('DELETE FROM times WHERE racha_id = $1').run(rachaId);

  const jogadores = confirmados.map(c => ({ ...c, nota: c.nota || 5 }));
  const times = sortearTimes(jogadores);

  // Inserir times
  for (const time of times) {
    for (const j of time.jogadores) {
      await db.prepare('INSERT INTO times (racha_id, time_numero, membro_id) VALUES ($1, $2, $3)').run(rachaId, time.time_numero, j.membro_id);
    }
  }

  res.json({ times });
});

// POST confirmar presenca
router.post('/:grupoId/rachas/:rachaId/confirmar', requireAuth, requireGroupMember, async (req, res) => {
  try {
    const db = getDb();
    const rachaId = Number(req.params.rachaId);
    const grupoId = Number(req.params.grupoId);
    const membroId = req.membro.id;

    const racha = await db.prepare('SELECT * FROM rachas WHERE id = $1 AND grupo_id = $2').get(rachaId, grupoId);
    if (!racha) return res.status(404).json({ error: 'Racha nao encontrado' });
    if (racha.status !== 'aberto') return res.status(400).json({ error: 'Racha nao esta aberto' });

    const penalizado = (await db.prepare('SELECT COUNT(*) as total FROM penalidades WHERE membro_id = $1 AND ativa = 1').get(membroId)).total > 0;
    if (penalizado) return res.status(403).json({ error: 'Voce esta penalizado e nao pode confirmar presenca' });

    const grupo = await db.prepare('SELECT mp_access_token FROM grupos WHERE id = $1').get(grupoId);
    if (!grupo?.mp_access_token) return res.status(400).json({ error: 'Mercado Pago nao conectado neste grupo. Peca ao admin para conectar.' });

    const existing = await db.prepare('SELECT * FROM confirmacoes WHERE racha_id = $1 AND membro_id = $2').get(rachaId, membroId);
    if (existing && existing.status === 'pago') return res.status(400).json({ error: 'Voce ja confirmou e pagou' });
    if (existing && existing.status === 'pendente' && existing.mp_payment_id) {
      return res.json({ confirmacao_id: existing.id, status: 'pendente', mp_payment_id: existing.mp_payment_id, message: 'Pagamento pendente' });
    }

    const totalPago = Number((await db.prepare("SELECT COUNT(*) as c FROM confirmacoes WHERE racha_id = $1 AND status = 'pago'").get(rachaId)).c);
    if (totalPago >= 18) return res.status(400).json({ error: 'Todas as vagas preenchidas' });

    const usuario = { nome: req.user.nome, email: req.user.email };
    const externalRef = `racha-${rachaId}-membro-${membroId}`;
    const webhookUrl = process.env.MP_WEBHOOK_URL || undefined;
    const pagamento = await criarPagamentoPix({
      accessToken: grupo.mp_access_token,
      descricao: `Racha ${new Date(racha.data).toLocaleDateString('pt-BR')} - ${usuario.nome}`,
      valor: racha.valor_por_pessoa,
      email: usuario.email,
      externalRef, webhookUrl,
    });

    if (existing) {
      await db.prepare("UPDATE confirmacoes SET status = 'pendente', mp_payment_id = $1, valor_pago = $2 WHERE id = $3")
        .run(String(pagamento.id), racha.valor_por_pessoa, existing.id);
    } else {
      await db.prepare("INSERT INTO confirmacoes (racha_id, membro_id, status, mp_payment_id, valor_pago) VALUES ($1, $2, 'pendente', $3, $4)")
        .run(rachaId, membroId, String(pagamento.id), racha.valor_por_pessoa);
    }

    const confirmacao = await db.prepare('SELECT * FROM confirmacoes WHERE racha_id = $1 AND membro_id = $2').get(rachaId, membroId);
    res.status(201).json({
      confirmacao_id: confirmacao.id, status: 'pendente', mp_payment_id: pagamento.id,
      qr_code: pagamento.qr_code, qr_code_base64: pagamento.qr_code_base64, valor: racha.valor_por_pessoa,
    });
  } catch (error) {
    console.error('[CONFIRMAR] Erro:', error.message);
    res.status(500).json({ error: 'Erro ao gerar pagamento: ' + error.message });
  }
});

// POST cancelar presenca
router.post('/:grupoId/rachas/:rachaId/sair', requireAuth, requireGroupMember, async (req, res) => {
  const db = getDb();
  const rachaId = Number(req.params.rachaId);
  const membroId = req.membro.id;
  const racha = await db.prepare('SELECT * FROM rachas WHERE id = $1 AND grupo_id = $2').get(rachaId, Number(req.params.grupoId));
  if (!racha) return res.status(404).json({ error: 'Racha nao encontrado' });
  if (racha.status !== 'aberto') return res.status(400).json({ error: 'Racha nao esta aberto' });
  await db.prepare('DELETE FROM confirmacoes WHERE racha_id = $1 AND membro_id = $2').run(rachaId, membroId);
  res.json({ message: 'Presenca cancelada' });
});

// GET pagamento status
router.get('/:grupoId/rachas/:rachaId/pagamento-status', requireAuth, requireGroupMember, async (req, res) => {
  const db = getDb();
  const confirmacao = await db.prepare('SELECT status, mp_payment_id FROM confirmacoes WHERE racha_id = $1 AND membro_id = $2')
    .get(Number(req.params.rachaId), req.membro.id);
  if (!confirmacao) return res.json({ status: 'nenhum' });
  res.json({ status: confirmacao.status, mp_payment_id: confirmacao.mp_payment_id });
});

// ─── CAIXINHA ───
router.get('/:grupoId/caixinha', async (req, res) => {
  const db = getDb();
  const grupoId = Number(req.params.grupoId);
  const entradas = Number((await db.prepare("SELECT COALESCE(SUM(valor), 0) as total FROM caixinha WHERE grupo_id = $1 AND tipo = 'entrada'").get(grupoId)).total);
  const saidas = Number((await db.prepare("SELECT COALESCE(SUM(valor), 0) as total FROM caixinha WHERE grupo_id = $1 AND tipo = 'saida'").get(grupoId)).total);
  const historico = await db.prepare('SELECT * FROM caixinha WHERE grupo_id = $1 ORDER BY created_at DESC').all(grupoId);
  res.json({ saldo: entradas - saidas, entradas, saidas, historico });
});

module.exports = router;
