require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDb, getDb } = require('./db/schema');
const { iniciarCron } = require('./services/cron');
const { buscarPagamento } = require('./services/mercadopago');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/grupos', require('./routes/grupos'));
app.use('/api/mp-oauth', require('./routes/mp-oauth'));

// Webhook Mercado Pago
app.post('/api/webhook/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type === 'payment' && data?.id) {
      const paymentId = String(data.id);
      console.log(`[WEBHOOK] Recebido payment ${paymentId}`);

      const db = getDb();
      const conf = await db.prepare(`SELECT c.*, r.grupo_id FROM confirmacoes c JOIN rachas r ON r.id = c.racha_id WHERE c.mp_payment_id = $1`).get(paymentId);
      if (!conf) { console.log(`[WEBHOOK] Confirmacao nao encontrada`); return res.sendStatus(200); }

      const grupo = await db.prepare('SELECT mp_access_token FROM grupos WHERE id = $1').get(conf.grupo_id);
      if (!grupo?.mp_access_token) { console.log(`[WEBHOOK] Grupo sem MP token`); return res.sendStatus(200); }

      const pagamento = await buscarPagamento(grupo.mp_access_token, data.id);
      if (pagamento.status === 'approved' && conf.status === 'pendente') {
        await db.prepare("UPDATE confirmacoes SET status = 'pago', paid_at = NOW() WHERE id = $1").run(conf.id);
        console.log(`[WEBHOOK] Pagamento ${paymentId} aprovado!`);
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('[WEBHOOK] Erro:', error.message);
    res.sendStatus(200);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  await initDb();
  console.log('[DB] Banco de dados inicializado.');
  app.listen(PORT, () => {
    console.log(`[SERVER] Rodando na porta ${PORT}`);
    iniciarCron();
  });
}

start().catch((err) => {
  console.error('[ERRO] Falha ao iniciar:', err);
  process.exit(1);
});
