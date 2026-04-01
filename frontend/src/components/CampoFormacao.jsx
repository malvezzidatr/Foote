import { motion } from 'framer-motion';

const TEAM_STYLES = [
  { bg: '#3b82f6', ring: '#93c5fd' },
  { bg: '#ef4444', ring: '#fca5a5' },
  { bg: '#f59e0b', ring: '#fcd34d' },
];

// Posicoes do campo de cima para baixo: Goleiro -> Defesa -> Meio -> Ataque
// Cada slot tem posicao Y (%) e X (%) para simular formacao real
const SLOTS_6 = [
  { role: 'Goleiro',   y: 76, x: 44 },   // goleiro no fundo
  { role: 'Zagueiro',  y: 70, x: 12 },   // zagueiro/lateral esquerdo
  { role: 'Zagueiro',  y: 70, x: 75 },   // zagueiro/lateral direito
  { role: 'Meia',      y: 43, x: 45 },   // meia centralizado
  { role: 'Atacante',  y: 13, x: 13 },   // ponta esquerda
  { role: 'Atacante',  y: 13, x: 75 },   // ponta direita
];

const POS_PRIORITY = {
  'Goleiro': 0,
  'Zagueiro': 1,
  'Lateral': 2,
  'Volante': 3,
  'Meia': 4,
  'Atacante': 5,
};

function distribuirFormacao(jogadores) {
  if (jogadores.length < 6) {
    // Fallback: distribui em linhas simples
    const sorted = [...jogadores].sort((a, b) => (POS_PRIORITY[b.posicao] ?? 3) - (POS_PRIORITY[a.posicao] ?? 3));
    const spacing = 100 / (sorted.length + 1);
    return sorted.map((j, i) => ({ ...j, x: 50, y: spacing * (i + 1) }));
  }

  // Classificar jogadores por posicao
  const goleiros = jogadores.filter(j => j.posicao === 'Goleiro');
  const defesa = jogadores.filter(j => ['Zagueiro', 'Lateral'].includes(j.posicao));
  const meias = jogadores.filter(j => ['Meia', 'Volante'].includes(j.posicao));
  const atacantes = jogadores.filter(j => j.posicao === 'Atacante');
  const outros = jogadores.filter(j => !POS_PRIORITY.hasOwnProperty(j.posicao));

  // Pool para preencher slots que nao tem jogador ideal
  const pool = [...outros, ...meias, ...defesa, ...atacantes, ...goleiros];
  const used = new Set();

  function pick(preferidos) {
    for (const j of preferidos) {
      if (!used.has(j.id)) { used.add(j.id); return j; }
    }
    for (const j of pool) {
      if (!used.has(j.id)) { used.add(j.id); return j; }
    }
    return null;
  }

  return [
    { ...pick(goleiros),  ...SLOTS_6[0] },
    { ...pick(defesa),    ...SLOTS_6[1] },
    { ...pick(defesa),    ...SLOTS_6[2] },
    { ...pick([...meias, ...outros]), ...SLOTS_6[3] },
    { ...pick(atacantes), ...SLOTS_6[4] },
    { ...pick(atacantes), ...SLOTS_6[5] },
  ].filter(Boolean);
}

export default function CampoFormacao({ times, onJogadorClick, isAdmin }) {
  if (!times || times.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {times.map((time, ti) => (
        <MiniCampo key={ti} time={time} teamIndex={ti} onJogadorClick={onJogadorClick} isAdmin={isAdmin} />
      ))}
    </div>
  );
}

function MiniCampo({ time, teamIndex, onJogadorClick, isAdmin }) {
  const style = TEAM_STYLES[teamIndex] || TEAM_STYLES[0];
  const nomes = ['Azul', 'Vermelho', 'Amarelo'];
  const posicoes = distribuirFormacao(time.jogadores_detalhes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: teamIndex * 0.12 }}
      className="rounded-3xl overflow-hidden border border-gray-100 bg-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: style.bg }}>
        <span className="text-white font-bold text-sm">Time {nomes[teamIndex]}</span>
        <div className="flex items-center gap-2">
          {isAdmin && time.media_notas && <span className="text-white/90 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Media {time.media_notas}</span>}
          <span className="text-white/70 text-xs font-bold">{time.jogadores_detalhes.length} jogadores</span>
        </div>
      </div>

      {/* Campo */}
      <div className="relative" style={{ background: 'linear-gradient(180deg, #2d8a4e 0%, #256e3e 100%)' }}>
        {/* Linhas do campo SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="none">
          {/* Bordas */}
          <rect x="8" y="8" width="184" height="284" rx="2" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          {/* Meio campo */}
          <line x1="8" y1="150" x2="192" y2="150" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          {/* Circulo central */}
          <circle cx="100" cy="150" r="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <circle cx="100" cy="150" r="2" fill="rgba(255,255,255,0.2)" />
          {/* Area superior */}
          <rect x="50" y="8" width="100" height="50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <rect x="70" y="8" width="60" height="22" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          {/* Area inferior */}
          <rect x="50" y="242" width="100" height="50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <rect x="70" y="270" width="60" height="22" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          {/* Faixas do gramado */}
          <rect x="0" y="0" width="200" height="50" fill="rgba(255,255,255,0.02)" />
          <rect x="0" y="100" width="200" height="50" fill="rgba(255,255,255,0.02)" />
          <rect x="0" y="200" width="200" height="50" fill="rgba(255,255,255,0.02)" />
        </svg>

        {/* Jogadores */}
        <div className="relative" style={{ minHeight: '300px' }}>
          {posicoes.map((j, i) => (
            <motion.div
              key={j.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + (i * 0.06), type: 'spring', stiffness: 300, damping: 18 }}
              className="absolute flex flex-col items-center gap-1 cursor-pointer group"
              style={{ top: `${j.y}%`, left: `${j.x}%`, transform: 'translate(-50%, -50%)' }}
              onClick={() => onJogadorClick?.(j.id)}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 scale-90 group-hover:scale-100 z-10">
                <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow-xl min-w-[120px]">
                  <p className="text-white text-xs font-bold truncate">{j.apelido || j.nome}</p>
                  <p className="text-gray-400 text-[10px]">{j.posicao}</p>
                  {isAdmin && <p className="text-lime-400 text-[10px] font-bold mt-0.5">Nota: {j.nota || 5}</p>}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gray-900/95" />
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 shadow-lg transition-transform group-hover:scale-110"
                style={{
                  background: style.bg,
                  borderColor: style.ring,
                  boxShadow: `0 2px 8px ${style.bg}66`,
                }}
              >
                {j.nome.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                <span className="text-white text-[9px] font-bold leading-none whitespace-nowrap">
                  {(j.apelido || j.nome.split(' ')[0]).substring(0, 8)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
