require('dotenv').config();
const { initDb, getDb } = require('./schema');

const JOGADORES = [
  { nome: 'Lucas Silva', email: 'lucas@demo.com', apelido: 'Lukinha', posicao: 'Atacante' },
  { nome: 'Rafael Costa', email: 'rafael@demo.com', apelido: 'Rafa', posicao: 'Meia' },
  { nome: 'Bruno Oliveira', email: 'bruno@demo.com', apelido: 'Brunao', posicao: 'Atacante' },
  { nome: 'Pedro Santos', email: 'pedro@demo.com', apelido: 'Pedrinho', posicao: 'Zagueiro' },
  { nome: 'Thiago Mendes', email: 'thiago@demo.com', apelido: 'Thiagao', posicao: 'Volante' },
  { nome: 'Felipe Souza', email: 'felipe@demo.com', apelido: 'Felipao', posicao: 'Lateral' },
  { nome: 'Gabriel Lima', email: 'gabriel@demo.com', apelido: 'Gabi', posicao: 'Goleiro' },
  { nome: 'Marcos Almeida', email: 'marcos@demo.com', apelido: 'Marquinhos', posicao: 'Meia' },
  { nome: 'Andre Rocha', email: 'andre@demo.com', apelido: 'Dede', posicao: 'Atacante' },
  { nome: 'Diego Ferreira', email: 'diego@demo.com', apelido: 'Diegao', posicao: 'Zagueiro' },
  { nome: 'Vinicius Ramos', email: 'vinicius@demo.com', apelido: 'Vini', posicao: 'Meia' },
  { nome: 'Caio Henrique', email: 'caio@demo.com', apelido: 'Caio', posicao: 'Lateral' },
  { nome: 'Matheus Dias', email: 'matheus@demo.com', apelido: 'Math', posicao: 'Volante' },
  { nome: 'Gustavo Nunes', email: 'gustavo@demo.com', apelido: 'Gugu', posicao: 'Atacante' },
  { nome: 'Leandro Barros', email: 'leandro@demo.com', apelido: 'Leleo', posicao: 'Meia' },
  { nome: 'Ricardo Moura', email: 'ricardo@demo.com', apelido: 'Rica', posicao: 'Goleiro' },
  { nome: 'Eduardo Pinto', email: 'eduardo@demo.com', apelido: 'Dudu', posicao: 'Zagueiro' },
  { nome: 'Julio Cesar', email: 'julio@demo.com', apelido: 'JC', posicao: 'Lateral' },
];

async function seed() {
  await initDb();
  const db = getDb();

  console.log('[SEED] Criando dados de demonstracao...');

  // Usuarios
  const userIds = [];
  for (let i = 0; i < JOGADORES.length; i++) {
    const j = JOGADORES[i];
    await db.prepare('INSERT INTO usuarios (google_id, nome, email, foto) VALUES ($1, $2, $3, $4)').run(`demo-${i + 1}`, j.nome, j.email, null);
    const user = await db.prepare('SELECT id FROM usuarios WHERE google_id = $1').get(`demo-${i + 1}`);
    userIds.push(user.id);
  }
  console.log(`[SEED] ${userIds.length} usuarios criados`);

  // Grupo
  const grupo = await db.prepare('INSERT INTO grupos (nome, descricao, local_padrao, valor_padrao, cor) VALUES ($1, $2, $3, $4, $5) RETURNING *')
    .get('Racha FC', 'Futebol toda quinta na Arena Society Premium', 'Arena Society Premium', 20, 'lime');
  const grupoId = grupo.id;
  console.log(`[SEED] Grupo criado: id=${grupoId}`);

  // Membros
  const membroIds = [];
  for (let i = 0; i < userIds.length; i++) {
    const j = JOGADORES[i];
    await db.prepare('INSERT INTO membros (grupo_id, usuario_id, role, apelido, posicao) VALUES ($1, $2, $3, $4, $5)')
      .run(grupoId, userIds[i], i === 0 ? 'admin' : 'membro', j.apelido, j.posicao);
    const membro = await db.prepare('SELECT id FROM membros WHERE grupo_id = $1 AND usuario_id = $2').get(grupoId, userIds[i]);
    membroIds.push(membro.id);
  }
  console.log(`[SEED] ${membroIds.length} membros adicionados`);

  // Racha 1 — finalizado, 18 jogadores
  const racha1 = await db.prepare(
    "INSERT INTO rachas (grupo_id, data, local, custo_campo, valor_por_pessoa, status, prazo_pagamento) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
  ).get(grupoId, '2026-03-20T20:00:00', 'Arena Society Premium', 280, 20, 'finalizado', '2026-03-19T20:00:00');

  for (const mid of membroIds) {
    await db.prepare("INSERT INTO confirmacoes (racha_id, membro_id, status, valor_pago, paid_at) VALUES ($1, $2, 'pago', $3, NOW())").run(racha1.id, mid, 20);
  }
  for (let t = 1; t <= 3; t++) {
    for (let j = (t - 1) * 6; j < t * 6; j++) {
      await db.prepare('INSERT INTO times (racha_id, time_numero, membro_id) VALUES ($1, $2, $3)').run(racha1.id, t, membroIds[j]);
    }
  }
  for (const s of [
    { idx: 0, g: 3, a: 1 }, { idx: 2, g: 2, a: 2 }, { idx: 8, g: 2, a: 0 }, { idx: 14, g: 4, a: 1 },
    { idx: 7, g: 0, a: 3 }, { idx: 13, g: 1, a: 1 }, { idx: 5, g: 1, a: 0 }, { idx: 1, g: 0, a: 2 },
  ]) {
    await db.prepare('INSERT INTO estatisticas (racha_id, membro_id, gols, assistencias) VALUES ($1, $2, $3, $4)').run(racha1.id, membroIds[s.idx], s.g, s.a);
  }
  console.log('[SEED] Racha 1 criado (18 jogadores, 3 times)');

  // Racha 2 — finalizado, 12 jogadores
  const racha2 = await db.prepare(
    "INSERT INTO rachas (grupo_id, data, local, custo_campo, valor_por_pessoa, status, prazo_pagamento) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
  ).get(grupoId, '2026-03-27T20:00:00', 'Quadra do Parque', 315, 20, 'finalizado', '2026-03-26T20:00:00');

  const conf2 = [0, 1, 2, 4, 5, 6, 7, 8, 10, 11, 13, 14];
  for (const idx of conf2) {
    await db.prepare("INSERT INTO confirmacoes (racha_id, membro_id, status, valor_pago, paid_at) VALUES ($1, $2, 'pago', $3, NOW())").run(racha2.id, membroIds[idx], 20);
  }
  for (let t = 1; t <= 3; t++) {
    for (let j = (t - 1) * 4; j < t * 4 && j < conf2.length; j++) {
      await db.prepare('INSERT INTO times (racha_id, time_numero, membro_id) VALUES ($1, $2, $3)').run(racha2.id, t, membroIds[conf2[j]]);
    }
  }
  for (const s of [
    { idx: 0, g: 2, a: 0 }, { idx: 2, g: 3, a: 1 }, { idx: 14, g: 2, a: 3 },
    { idx: 8, g: 1, a: 1 }, { idx: 7, g: 1, a: 2 }, { idx: 11, g: 0, a: 1 },
  ]) {
    await db.prepare('INSERT INTO estatisticas (racha_id, membro_id, gols, assistencias) VALUES ($1, $2, $3, $4)').run(racha2.id, membroIds[s.idx], s.g, s.a);
  }
  console.log('[SEED] Racha 2 criado (12 jogadores)');

  // Racha 3 — finalizado, 16 jogadores
  const racha3 = await db.prepare(
    "INSERT INTO rachas (grupo_id, data, local, custo_campo, valor_por_pessoa, status, prazo_pagamento) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
  ).get(grupoId, '2026-04-03T20:00:00', 'Arena Society Premium', 252, 20, 'finalizado', '2026-04-02T20:00:00');

  const conf3 = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17];
  for (const idx of conf3) {
    await db.prepare("INSERT INTO confirmacoes (racha_id, membro_id, status, valor_pago, paid_at) VALUES ($1, $2, 'pago', $3, NOW())").run(racha3.id, membroIds[idx], 20);
  }
  for (const s of [
    { idx: 14, g: 5, a: 2 }, { idx: 0, g: 1, a: 2 }, { idx: 2, g: 2, a: 0 },
    { idx: 8, g: 3, a: 1 }, { idx: 13, g: 2, a: 0 }, { idx: 4, g: 0, a: 2 },
  ]) {
    await db.prepare('INSERT INTO estatisticas (racha_id, membro_id, gols, assistencias) VALUES ($1, $2, $3, $4)').run(racha3.id, membroIds[s.idx], s.g, s.a);
  }
  console.log('[SEED] Racha 3 criado (16 jogadores)');

  // Racha 4 — aberto
  const rachaAberto = await db.prepare(
    "INSERT INTO rachas (grupo_id, data, local, valor_por_pessoa, status, prazo_pagamento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"
  ).get(grupoId, '2026-04-10T20:00:00', 'Arena Society Premium', 20, 'aberto', '2026-04-09T20:00:00');

  for (const idx of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]) {
    await db.prepare("INSERT INTO confirmacoes (racha_id, membro_id, status, valor_pago, paid_at) VALUES ($1, $2, 'pago', $3, NOW())").run(rachaAberto.id, membroIds[idx], 20);
  }
  for (const idx of [3, 6]) {
    await db.prepare("INSERT INTO confirmacoes (racha_id, membro_id, status, valor_pago) VALUES ($1, $2, 'pendente', $3)").run(rachaAberto.id, membroIds[idx], 20);
  }
  console.log('[SEED] Racha aberto criado (10 pagos, 2 pendentes)');

  // Penalidades
  await db.prepare("INSERT INTO penalidades (grupo_id, membro_id, racha_id, tipo, motivo, duracao, ativa) VALUES ($1, $2, $3, $4, $5, $6, $7)")
    .run(grupoId, membroIds[9], racha1.id, 'suspensao', 'Briga em campo', '1 semana', 0);
  await db.prepare("INSERT INTO penalidades (grupo_id, membro_id, racha_id, tipo, motivo, valor, ativa) VALUES ($1, $2, $3, $4, $5, $6, $7)")
    .run(grupoId, membroIds[3], racha2.id, 'multa', 'Pagou e nao compareceu', 20, 0);
  await db.prepare("INSERT INTO penalidades (grupo_id, membro_id, racha_id, tipo, motivo, ativa) VALUES ($1, $2, $3, $4, $5, $6)")
    .run(grupoId, membroIds[12], racha3.id, 'advertencia', 'Reclamacao excessiva', 1);
  await db.prepare("INSERT INTO penalidades (grupo_id, membro_id, racha_id, tipo, motivo, duracao, ativa) VALUES ($1, $2, $3, $4, $5, $6, $7)")
    .run(grupoId, membroIds[9], racha3.id, 'suspensao', 'Falta violenta', '2 semanas', 1);
  console.log('[SEED] Penalidades criadas');

  // Caixinha
  await db.prepare("INSERT INTO caixinha (grupo_id, racha_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4, $5)").run(grupoId, racha1.id, 'Excedente racha 20/03', 'entrada', 80);
  await db.prepare("INSERT INTO caixinha (grupo_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4)").run(grupoId, 'Bola Penalty campo', 'saida', 45);
  await db.prepare("INSERT INTO caixinha (grupo_id, racha_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4, $5)").run(grupoId, racha2.id, 'Deficit racha 27/03', 'saida', 75);
  await db.prepare("INSERT INTO caixinha (grupo_id, racha_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4, $5)").run(grupoId, racha3.id, 'Excedente racha 03/04', 'entrada', 68);
  await db.prepare("INSERT INTO caixinha (grupo_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4)").run(grupoId, 'Multa - Pedro Santos', 'entrada', 20);
  await db.prepare("INSERT INTO caixinha (grupo_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4)").run(grupoId, 'Coletes novos', 'saida', 38);
  await db.prepare("INSERT INTO caixinha (grupo_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4)").run(grupoId, 'Coletes novos', 'saida', 48);
  await db.prepare("INSERT INTO caixinha (grupo_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4)").run(grupoId, 'Multa - Pedro Santos', 'entrada', 25);
  await db.prepare("INSERT INTO caixinha (grupo_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4)").run(grupoId, 'Coletes novos', 'saida', 55);
  await db.prepare("INSERT INTO caixinha (grupo_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4)").run(grupoId, 'Coletes novos', 'saida', 12);
  await db.prepare("INSERT INTO caixinha (grupo_id, descricao, tipo, valor) VALUES ($1, $2, $3, $4)").run(grupoId, 'Multa - Pedro Santos', 'entrada', 70);

  console.log('[SEED] Caixinha criada');

  console.log(`\n[SEED] Pronto! Acesse: http://localhost:5173/g/${grupoId}`);
  process.exit(0);
}

seed().catch(err => { console.error('[SEED] Erro:', err); process.exit(1); });
