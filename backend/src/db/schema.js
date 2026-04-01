const { Pool } = require('pg');

let pool;
let db;

// Wrapper que mantém a mesma API das rotas (prepare/run/get/all)
function wrapPool(pool) {
  return {
    prepare(sql) {
      // Converte ? para $1, $2, etc (sqlite -> postgres)
      let idx = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++idx}`);

      return {
        async run(...params) {
          const result = await pool.query(pgSql + ' RETURNING *', params);
          const row = result.rows[0];
          return {
            lastInsertRowid: row?.id || null,
            changes: result.rowCount,
          };
        },
        async get(...params) {
          const result = await pool.query(pgSql, params);
          return result.rows[0] || undefined;
        },
        async all(...params) {
          const result = await pool.query(pgSql, params);
          return result.rows;
        },
      };
    },
    async exec(sql) {
      await pool.query(sql);
    },
    transaction(fn) {
      return async (...args) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await fn(...args);
          await client.query('COMMIT');
          return result;
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
      };
    },
  };
}

async function initDb() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  } else {
    // Local: precisa de PostgreSQL rodando
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'rachafc',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
  }

  // Testar conexao
  await pool.query('SELECT 1');

  db = wrapPool(pool);

  // Criar tabelas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      google_id TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      foto TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS grupos (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT,
      local_padrao TEXT,
      valor_padrao REAL NOT NULL DEFAULT 20.00,
      cor TEXT DEFAULT 'lime',
      mp_access_token TEXT,
      mp_refresh_token TEXT,
      mp_user_id TEXT,
      mp_connected_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS membros (
      id SERIAL PRIMARY KEY,
      grupo_id INTEGER NOT NULL REFERENCES grupos(id),
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      role TEXT NOT NULL DEFAULT 'membro',
      posicao TEXT DEFAULT 'Meia',
      apelido TEXT,
      nota REAL NOT NULL DEFAULT 5,
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(grupo_id, usuario_id)
    );

    CREATE TABLE IF NOT EXISTS rachas (
      id SERIAL PRIMARY KEY,
      grupo_id INTEGER NOT NULL REFERENCES grupos(id),
      data TEXT NOT NULL,
      local TEXT,
      custo_campo REAL,
      valor_por_pessoa REAL NOT NULL DEFAULT 20.00,
      status TEXT NOT NULL DEFAULT 'aberto',
      prazo_pagamento TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS confirmacoes (
      id SERIAL PRIMARY KEY,
      racha_id INTEGER NOT NULL REFERENCES rachas(id),
      membro_id INTEGER NOT NULL REFERENCES membros(id),
      status TEXT NOT NULL DEFAULT 'pendente',
      mp_payment_id TEXT,
      valor_pago REAL,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS times (
      id SERIAL PRIMARY KEY,
      racha_id INTEGER NOT NULL REFERENCES rachas(id),
      time_numero INTEGER NOT NULL,
      membro_id INTEGER NOT NULL REFERENCES membros(id),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS estatisticas (
      id SERIAL PRIMARY KEY,
      racha_id INTEGER NOT NULL REFERENCES rachas(id),
      membro_id INTEGER NOT NULL REFERENCES membros(id),
      gols INTEGER NOT NULL DEFAULT 0,
      assistencias INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS penalidades (
      id SERIAL PRIMARY KEY,
      grupo_id INTEGER NOT NULL REFERENCES grupos(id),
      membro_id INTEGER NOT NULL REFERENCES membros(id),
      racha_id INTEGER REFERENCES rachas(id),
      tipo TEXT NOT NULL,
      motivo TEXT NOT NULL,
      duracao TEXT,
      valor REAL,
      ativa INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS caixinha (
      id SERIAL PRIMARY KEY,
      grupo_id INTEGER NOT NULL REFERENCES grupos(id),
      racha_id INTEGER REFERENCES rachas(id),
      descricao TEXT NOT NULL,
      tipo TEXT NOT NULL,
      valor REAL NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Migrations
  try {
    await db.prepare("ALTER TABLE membros ADD COLUMN nota REAL NOT NULL DEFAULT 5").run();
  } catch {}

  return db;
}

function getDb() {
  if (!db) throw new Error('Banco nao inicializado. Chame initDb() primeiro.');
  return db;
}

function getPool() {
  return pool;
}

module.exports = { initDb, getDb, getPool };
