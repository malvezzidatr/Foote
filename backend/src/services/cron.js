const cron = require('node-cron');
const { getDb } = require('../db/schema');

function iniciarCron() {
  cron.schedule('0 * * * *', async () => {
    const db = getDb();
    const agora = new Date().toISOString();

    const rachasExpirados = await db.prepare(`
      SELECT id FROM rachas WHERE status = 'aberto' AND prazo_pagamento <= $1
    `).all(agora);

    for (const racha of rachasExpirados) {
      await db.prepare("UPDATE confirmacoes SET status = 'removido' WHERE racha_id = $1 AND status = 'pendente'").run(racha.id);
      await db.prepare("UPDATE rachas SET status = 'fechado' WHERE id = $1").run(racha.id);
    }

    if (rachasExpirados.length > 0) {
      console.log(`[CRON] ${rachasExpirados.length} racha(s) fechado(s).`);
    }
  });

  console.log('[CRON] Agendamento de remocao automatica ativo.');
}

module.exports = { iniciarCron };
