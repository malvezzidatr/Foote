// ─── GRUPOS ───
export const grupos = [
  {
    id: 1,
    nome: 'Racha FC',
    descricao: 'Futebol toda quinta na Arena Society',
    admin: 'Lucas Silva',
    cor: 'lime',
    membros: 18,
    proximo_racha: '2026-04-10T20:00:00',
    local: 'Arena Society Premium',
    valor: 20,
    created_at: '2025-08-15',
  },
  {
    id: 2,
    nome: 'Pelada do Domingo',
    descricao: 'Society domingueira no Parque',
    admin: 'Carlos Eduardo',
    cor: 'blue',
    membros: 14,
    proximo_racha: '2026-04-13T09:00:00',
    local: 'Quadra do Parque',
    valor: 15,
    created_at: '2026-01-10',
  },
  {
    id: 3,
    nome: 'Veteranos FC',
    descricao: 'Acima de 35 anos, sem correria',
    admin: 'Roberto Gomes',
    cor: 'amber',
    membros: 20,
    proximo_racha: null,
    local: 'Campo do Sesi',
    valor: 25,
    created_at: '2024-03-01',
  },
];

export function getGrupo(id) {
  return grupos.find(g => g.id === id);
}

// ─── JOGADORES ───
export const jogadores = [
  { id: 1, nome: 'Lucas Silva', apelido: 'Lukinha', nota: 8.5, posicao: 'Atacante', foto: null, ativo: true },
  { id: 2, nome: 'Rafael Costa', apelido: 'Rafa', nota: 7.0, posicao: 'Meia', foto: null, ativo: true },
  { id: 3, nome: 'Bruno Oliveira', apelido: 'Brunão', nota: 9.0, posicao: 'Atacante', foto: null, ativo: true },
  { id: 4, nome: 'Pedro Santos', apelido: 'Pedrinho', nota: 6.5, posicao: 'Zagueiro', foto: null, ativo: true },
  { id: 5, nome: 'Thiago Mendes', apelido: 'Thiagão', nota: 7.5, posicao: 'Volante', foto: null, ativo: true },
  { id: 6, nome: 'Felipe Souza', apelido: 'Felipão', nota: 8.0, posicao: 'Lateral', foto: null, ativo: true },
  { id: 7, nome: 'Gabriel Lima', apelido: 'Gabi', nota: 6.0, posicao: 'Goleiro', foto: null, ativo: true },
  { id: 8, nome: 'Marcos Almeida', apelido: 'Marquinhos', nota: 7.5, posicao: 'Meia', foto: null, ativo: true },
  { id: 9, nome: 'Andre Rocha', apelido: 'Dedé', nota: 8.0, posicao: 'Atacante', foto: null, ativo: true },
  { id: 10, nome: 'Diego Ferreira', apelido: 'Diegão', nota: 5.5, posicao: 'Zagueiro', foto: null, ativo: true },
  { id: 11, nome: 'Vinicius Ramos', apelido: 'Vini', nota: 7.0, posicao: 'Meia', foto: null, ativo: true },
  { id: 12, nome: 'Caio Henrique', apelido: 'Caio', nota: 8.5, posicao: 'Lateral', foto: null, ativo: true },
  { id: 13, nome: 'Matheus Dias', apelido: 'Math', nota: 6.5, posicao: 'Volante', foto: null, ativo: true },
  { id: 14, nome: 'Gustavo Nunes', apelido: 'Gugu', nota: 7.0, posicao: 'Atacante', foto: null, ativo: true },
  { id: 15, nome: 'Leandro Barros', apelido: 'Leleo', nota: 9.5, posicao: 'Meia', foto: null, ativo: true },
  { id: 16, nome: 'Ricardo Moura', apelido: 'Rica', nota: 5.0, posicao: 'Goleiro', foto: null, ativo: true },
  { id: 17, nome: 'Eduardo Pinto', apelido: 'Dudu', nota: 7.5, posicao: 'Zagueiro', foto: null, ativo: true },
  { id: 18, nome: 'Julio Cesar', apelido: 'JC', nota: 8.0, posicao: 'Lateral', foto: null, ativo: true },
];

// ─── RACHAS ───
export const rachas = [
  {
    id: 1,
    data: '2026-04-10T20:00:00',
    status: 'aberto',
    custo_campo: null,
    local: 'Arena Society Premium',
    confirmados: [1, 2, 3, 5, 6, 8, 9, 12, 14, 15],
    pendentes: [4, 7],
    times: null,
  },
  {
    id: 2,
    data: '2026-04-17T20:00:00',
    status: 'aberto',
    custo_campo: null,
    local: 'Arena Society Premium',
    confirmados: [1, 3],
    pendentes: [],
    times: null,
  },
  {
    id: 3,
    data: '2026-04-03T20:00:00',
    status: 'finalizado',
    custo_campo: 280,
    local: 'Arena Society Premium',
    confirmados: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    pendentes: [],
    times: [
      { numero: 1, jogadores: [1, 5, 8, 12, 14, 16] },
      { numero: 2, jogadores: [3, 6, 9, 11, 17, 7] },
      { numero: 3, jogadores: [2, 4, 10, 13, 15, 18] },
    ],
  },
  {
    id: 4,
    data: '2026-03-27T20:00:00',
    status: 'finalizado',
    custo_campo: 315,
    local: 'Quadra do Parque',
    confirmados: [1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 14, 15],
    pendentes: [],
    times: [
      { numero: 1, jogadores: [1, 5, 11, 14] },
      { numero: 2, jogadores: [3, 6, 8, 15] },
      { numero: 3, jogadores: [2, 7, 9, 12] },
    ],
  },
  {
    id: 5,
    data: '2026-03-20T19:30:00',
    status: 'finalizado',
    custo_campo: 252,
    local: 'Arena Society Premium',
    confirmados: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18],
    pendentes: [],
    times: [
      { numero: 1, jogadores: [1, 4, 8, 13, 15, 18] },
      { numero: 2, jogadores: [3, 5, 9, 10, 12, 17] },
      { numero: 3, jogadores: [2, 6, 11, 14] },
    ],
  },
];

// ─── ESTATISTICAS POR RACHA ───
export const estatisticas = [
  // Racha 3
  { racha_id: 3, jogador_id: 1, gols: 3, assistencias: 1 },
  { racha_id: 3, jogador_id: 3, gols: 2, assistencias: 2 },
  { racha_id: 3, jogador_id: 9, gols: 2, assistencias: 0 },
  { racha_id: 3, jogador_id: 15, gols: 4, assistencias: 1 },
  { racha_id: 3, jogador_id: 8, gols: 0, assistencias: 3 },
  { racha_id: 3, jogador_id: 14, gols: 1, assistencias: 1 },
  { racha_id: 3, jogador_id: 6, gols: 1, assistencias: 0 },
  { racha_id: 3, jogador_id: 2, gols: 0, assistencias: 2 },
  // Racha 4
  { racha_id: 4, jogador_id: 1, gols: 2, assistencias: 0 },
  { racha_id: 4, jogador_id: 3, gols: 3, assistencias: 1 },
  { racha_id: 4, jogador_id: 15, gols: 2, assistencias: 3 },
  { racha_id: 4, jogador_id: 9, gols: 1, assistencias: 1 },
  { racha_id: 4, jogador_id: 8, gols: 1, assistencias: 2 },
  { racha_id: 4, jogador_id: 12, gols: 0, assistencias: 1 },
  // Racha 5
  { racha_id: 5, jogador_id: 15, gols: 5, assistencias: 2 },
  { racha_id: 5, jogador_id: 1, gols: 1, assistencias: 2 },
  { racha_id: 5, jogador_id: 3, gols: 2, assistencias: 0 },
  { racha_id: 5, jogador_id: 9, gols: 3, assistencias: 1 },
  { racha_id: 5, jogador_id: 14, gols: 2, assistencias: 0 },
  { racha_id: 5, jogador_id: 5, gols: 0, assistencias: 2 },
];

// ─── PENALIDADES ───
export const penalidades = [
  { id: 1, jogador_id: 10, tipo: 'suspensao', motivo: 'Briga em campo', duracao: '1 semana', data: '2026-03-20', ativa: false },
  { id: 2, jogador_id: 4, tipo: 'multa', motivo: 'Pagou e nao compareceu', valor: 20, data: '2026-03-27', ativa: false },
  { id: 3, jogador_id: 13, tipo: 'advertencia', motivo: 'Reclamacao excessiva', data: '2026-04-03', ativa: true },
  { id: 4, jogador_id: 10, tipo: 'suspensao', motivo: 'Falta violenta', duracao: '2 semanas', data: '2026-04-03', ativa: true },
];

// ─── PAGAMENTOS ───
export const pagamentos = [
  // Racha 3 - todos pagaram
  ...rachas[2].confirmados.map(id => ({ racha_id: 3, jogador_id: id, status: 'pago', valor: 20 })),
  // Racha 4 - um calote
  ...rachas[3].confirmados.filter(id => id !== 4).map(id => ({ racha_id: 4, jogador_id: id, status: 'pago', valor: 20 })),
  { racha_id: 4, jogador_id: 4, status: 'calote', valor: 20 },
  // Racha 5
  ...rachas[4].confirmados.map(id => ({ racha_id: 5, jogador_id: id, status: 'pago', valor: 20 })),
  // Racha 1 (aberto)
  ...rachas[0].confirmados.map(id => ({ racha_id: 1, jogador_id: id, status: 'pago', valor: 20 })),
];

// ─── CAIXINHA ───
export const caixinha = {
  saldo: 185.00,
  historico: [
    { id: 1, tipo: 'entrada', descricao: 'Excedente racha 20/03', valor: 68, data: '2026-03-20' },
    { id: 2, tipo: 'saida', descricao: 'Bola Penalty campo', valor: 45, data: '2026-03-22' },
    { id: 3, tipo: 'entrada', descricao: 'Excedente racha 27/03', valor: -75, data: '2026-03-27' },
    { id: 4, tipo: 'entrada', descricao: 'Excedente racha 03/04', valor: 80, data: '2026-04-03' },
    { id: 5, tipo: 'entrada', descricao: 'Multa - Pedro Santos (calote)', valor: 20, data: '2026-03-28' },
    { id: 6, tipo: 'saida', descricao: 'Coletes novos (3 cores)', valor: 38, data: '2026-04-01' },
  ],
};

// ─── HELPERS ───
export function getJogador(id) {
  return jogadores.find(j => j.id === id);
}

export function getJogadorStats(jogadorId) {
  const rachasJogou = rachas.filter(r => r.status === 'finalizado' && r.confirmados.includes(jogadorId));
  const rachasNaoFoi = pagamentos.filter(p => p.jogador_id === jogadorId && p.status === 'calote');
  const stats = estatisticas.filter(e => e.jogador_id === jogadorId);
  const pens = penalidades.filter(p => p.jogador_id === jogadorId);
  const totalGols = stats.reduce((acc, s) => acc + s.gols, 0);
  const totalAssist = stats.reduce((acc, s) => acc + s.assistencias, 0);
  const ultimoRacha = rachasJogou.sort((a, b) => new Date(b.data) - new Date(a.data))[0];

  return {
    jogos: rachasJogou.length,
    gols: totalGols,
    assistencias: totalAssist,
    calotes: rachasNaoFoi.length,
    penalidades: pens,
    penalidade_ativa: pens.some(p => p.ativa),
    ultimo_jogo: ultimoRacha?.data || null,
    media_gols: rachasJogou.length > 0 ? (totalGols / rachasJogou.length).toFixed(1) : '0.0',
    participacao: rachasJogou.length,
    historico_por_racha: stats,
  };
}

export function getRachaDetalhado(rachaId) {
  const racha = rachas.find(r => r.id === rachaId);
  if (!racha) return null;
  return {
    ...racha,
    confirmados_detalhes: racha.confirmados.map(id => getJogador(id)),
    pendentes_detalhes: racha.pendentes.map(id => getJogador(id)),
    estatisticas: estatisticas.filter(e => e.racha_id === rachaId).map(e => ({
      ...e,
      jogador: getJogador(e.jogador_id),
    })),
    times_detalhados: racha.times?.map(t => ({
      ...t,
      jogadores_detalhes: t.jogadores.map(id => getJogador(id)),
      soma_notas: t.jogadores.reduce((acc, id) => acc + (getJogador(id)?.nota || 0), 0),
    })) || null,
  };
}
