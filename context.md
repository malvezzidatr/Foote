# Racha FC — Contexto do Projeto

## O Problema

Racha de futebol semanal com 3 times de 6 pessoas (18 no total). Os problemas atuais são:

- Pagamento só acontece **depois** do jogo, gerando atrasos e esquecimentos
- O valor por pessoa varia conforme quantas pessoas confirmam
- Pessoas entram e saem da lista em cima da hora
- Sem controle centralizado — tudo gerenciado no WhatsApp

---

## A Solução Definida

### Regra principal
- Valor fixo de **R$20,00 por pessoa**, independente de quantos forem
- **Pagou = confirmado. Não pagou = fora.**
- Prazo: **24h antes do jogo**. Quem não pagou até lá é removido automaticamente
- Quem entrar com menos de 24h de antecedência também precisa pagar para confirmar

### Caixinha
- O excedente (R$20 × presentes − custo real do campo) vai para uma caixinha do grupo
- Saldo fica visível para todos no site (transparência)
- Usado para: cobrir semanas com menos jogadores, comprar bola, uniforme, churrasco, etc
- Não é um banco — o dinheiro fica com o organizador, o app só controla o saldo

### Custo do campo
- Varia entre **R$252 e R$315** por semana (2 horas)
- R$20 × 18 pessoas = R$360, cobrindo qualquer cenário com folga
- Mesmo com só 12 pessoas: R$240 — ainda cobre o pior caso

---

## Funcionalidades do Site

### Página pública (jogadores)
- Ver lista da semana com vagas disponíveis
- Ver quantos já confirmaram
- Pagar R$20 via Pix e ter nome confirmado automaticamente
- Ver saldo atual da caixinha

### Painel admin (só o organizador)
- Login com senha
- Criar racha da semana (definir data)
- Gerenciar jogadores cadastrados e suas notas
- Ver lista de confirmados e pagamentos
- Sortear times equilibrados automaticamente
- Informar custo real do campo após o jogo (atualiza caixinha)
- Ver histórico de rachas anteriores

---

## Sorteio de Times

- Sempre **3 times de 6 jogadores**
- Cada jogador tem uma **nota geral** (1 a 10)
- Algoritmo distribui jogadores de forma que a **soma das notas de cada time seja a mais parecida possível**
- Sorteio automático pelo sistema, acionado pelo admin

---

## Stack Técnica

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Banco:** SQLite (via `better-sqlite3`) — sem necessidade de servidor separado
- **Pagamentos:** Mercado Pago API (webhook Pix para confirmação automática)
- **Agendamento:** `node-cron` para remoção automática após prazo
- **Autenticação admin:** senha simples via variável de ambiente

### Frontend
- **Framework:** React
- **Estilo:** Tailwind CSS
- **Build:** Vite

### Hospedagem sugerida
- **Backend:** Railway ou Render (plano gratuito para começar)
- **Frontend:** Vercel ou Netlify

---

## Estrutura de Pastas Sugerida

```
racha/
├── backend/
│   ├── src/
│   │   ├── index.js           # entry point
│   │   ├── routes/
│   │   │   ├── racha.js       # criar racha, listar, buscar
│   │   │   ├── jogadores.js   # CRUD jogadores + notas
│   │   │   ├── pagamentos.js  # webhook Mercado Pago
│   │   │   ├── sorteio.js     # gerar times equilibrados
│   │   │   └── caixinha.js    # saldo e histórico
│   │   ├── services/
│   │   │   ├── mercadopago.js # criar pagamento Pix, verificar status
│   │   │   ├── sorteio.js     # algoritmo de balanceamento
│   │   │   └── cron.js        # job de remoção por prazo
│   │   ├── middleware/
│   │   │   └── auth.js        # proteção das rotas admin
│   │   └── db/
│   │       └── schema.js      # setup do SQLite
│   ├── db/
│   │   └── racha.db           # gerado automaticamente
│   ├── .env                   # variáveis de ambiente (não commitar)
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx        # página pública (lista + pagamento)
    │   │   ├── Admin.jsx       # painel admin
    │   │   └── Login.jsx       # login admin
    │   ├── components/
    │   │   ├── ListaJogadores.jsx
    │   │   ├── StatusPagamento.jsx
    │   │   ├── Caixinha.jsx
    │   │   └── Times.jsx       # exibe resultado do sorteio
    │   ├── services/
    │   │   └── api.js          # chamadas ao backend
    │   └── App.jsx
    ├── index.html
    └── package.json
```

---

## Banco de Dados (SQLite)

### Tabela `jogadores`
```sql
CREATE TABLE jogadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  nota REAL NOT NULL DEFAULT 5.0,
  ativo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Tabela `rachas`
```sql
CREATE TABLE rachas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,
  custo_campo REAL,
  valor_por_pessoa REAL NOT NULL DEFAULT 20.00,
  status TEXT NOT NULL DEFAULT 'aberto', -- aberto | fechado | finalizado
  prazo_pagamento TEXT NOT NULL,         -- 24h antes do jogo
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Tabela `confirmacoes`
```sql
CREATE TABLE confirmacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  racha_id INTEGER NOT NULL REFERENCES rachas(id),
  jogador_id INTEGER REFERENCES jogadores(id),
  nome_avulso TEXT,                      -- para quem não está cadastrado
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente | pago | removido
  mp_payment_id TEXT,                    -- ID do pagamento no Mercado Pago
  valor_pago REAL,
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Tabela `caixinha`
```sql
CREATE TABLE caixinha (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  racha_id INTEGER REFERENCES rachas(id),
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL,   -- entrada | saida
  valor REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Tabela `times`
```sql
CREATE TABLE times (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  racha_id INTEGER NOT NULL REFERENCES rachas(id),
  time_numero INTEGER NOT NULL,    -- 1, 2 ou 3
  jogador_id INTEGER REFERENCES jogadores(id),
  nome_avulso TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## Fluxo Principal

```
1. Admin cria o racha da semana com a data
2. Admin envia o link para o grupo do WhatsApp
3. Jogador abre o link → vê lista + vagas disponíveis
4. Jogador informa o nome e clica em "Confirmar e Pagar"
5. Sistema gera QR Code Pix via Mercado Pago (R$20)
6. Jogador paga → Mercado Pago dispara webhook → backend confirma automaticamente
7. Nome aparece na lista como confirmado
8. 24h antes do jogo: cron job remove quem não pagou
9. Admin sorteia os times no painel
10. Admin informa custo real do campo após o jogo
11. Sistema calcula e registra o saldo da caixinha
```

---

## Algoritmo de Sorteio

O objetivo é distribuir 18 jogadores em 3 times de 6 com a menor diferença possível entre a soma das notas.

```js
// Pseudo-código
function sortearTimes(jogadores) {
  // 1. Ordena jogadores por nota (maior para menor)
  // 2. Distribui em "cobra" (snake draft):
  //    Rodada 1: Time1, Time2, Time3
  //    Rodada 2: Time3, Time2, Time1
  //    Rodada 3: Time1, Time2, Time3 ...
  // 3. Snake draft naturalmente equilibra a soma das notas
  // 4. Retorna os 3 times com jogadores e soma de cada
}
```

O snake draft é simples e produz times bem equilibrados. Se quiser refinamento extra, pode rodar algumas iterações de troca aleatória e manter a melhor combinação.

---

## Integração Mercado Pago

### Criar pagamento Pix
```js
// POST /api/pagamentos/criar
// Cria um pagamento Pix de R$20 e retorna QR Code
const payment = await mp.payment.create({
  transaction_amount: 20.00,
  description: `Racha ${data} - ${nomeJogador}`,
  payment_method_id: 'pix',
  payer: { email: 'jogador@racha.com' }
})
// Retorna: qr_code, qr_code_base64, id do pagamento
```

### Webhook (confirmação automática)
```js
// POST /api/pagamentos/webhook
// Mercado Pago chama essa rota quando o pagamento é confirmado
// Verificar assinatura → buscar confirmação pelo mp_payment_id → atualizar status para 'pago'
```

### Configurar webhook no Mercado Pago
- Acesse: https://www.mercadopago.com.br/developers/panel
- Webhooks → adicionar URL: `https://seu-dominio.com/api/pagamentos/webhook`
- Evento: `payment`

---

## Variáveis de Ambiente (.env)

```env
PORT=3001
MP_ACCESS_TOKEN=seu_access_token_aqui
MP_WEBHOOK_SECRET=seu_webhook_secret_aqui
ADMIN_PASSWORD=senha_forte_aqui
FRONTEND_URL=http://localhost:5173
PIX_KEY=seu_cpf_ou_chave_pix
PIX_KEY_TYPE=cpf
PIX_NAME=Seu Nome Completo
```

---

## Como Obter o Access Token do Mercado Pago

1. Acesse https://www.mercadopago.com.br/developers/panel
2. Crie um aplicativo
3. Copie o **Access Token de produção**
4. Para testes use o **Access Token de sandbox**

---

## Comandos para Iniciar

```bash
# Backend
cd backend
npm install
cp .env.example .env
# edite o .env com suas credenciais
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## Decisões Tomadas Durante o Planejamento

| Decisão | Motivo |
|---|---|
| Valor fixo R$20 | Elimina dependência de saber quantos vão antes de cobrar |
| Pix via Mercado Pago | Confirmação automática via webhook, sem verificar comprovante |
| SQLite | Simples, sem servidor, suficiente para o volume de dados |
| Snake draft para sorteio | Algoritmo simples que naturalmente equilibra somas |
| Caixinha sem movimentação real | Evita complexidade de ser "banco", admin guarda o dinheiro |
| Remoção automática 24h antes | Resolve o problema de confirmações em cima da hora |