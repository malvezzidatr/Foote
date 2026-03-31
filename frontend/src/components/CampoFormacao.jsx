import { motion } from 'framer-motion';

const TEAM_STYLES = [
  { bg: '#3b82f6', ring: '#93c5fd' },
  { bg: '#ef4444', ring: '#fca5a5' },
  { bg: '#f59e0b', ring: '#fcd34d' },
];

// Distribui jogadores na formacao 2-1-2-1 (ataque → goleiro)
// Prioridade por posicao real, fallback por ordem
const POS_PRIORITY = {
  'Atacante': 0,
  'Meia': 1,
  'Volante': 2,
  'Lateral': 2,
  'Zagueiro': 3,
  'Goleiro': 4,
};

function distribuirFormacao(jogadores) {
  // Ordena por posicao (atacantes primeiro, goleiro por ultimo)
  const sorted = [...jogadores].sort((a, b) => {
    const pa = POS_PRIORITY[a.posicao] ?? 2;
    const pb = POS_PRIORITY[b.posicao] ?? 2;
    return pa - pb;
  });

  if (sorted.length >= 6) {
    return [
      sorted.slice(0, 2),  // 2 atacantes/pontas
      sorted.slice(2, 3),  // 1 meia/volante
      sorted.slice(3, 5),  // 2 laterais/zagueiros
      sorted.slice(5, 6),  // 1 goleiro
    ];
  }
  if (sorted.length === 5) return [sorted.slice(0, 2), sorted.slice(2, 3), sorted.slice(3, 5)];
  if (sorted.length === 4) return [sorted.slice(0, 2), sorted.slice(2, 4)];
  if (sorted.length === 3) return [sorted.slice(0, 1), sorted.slice(1, 2), sorted.slice(2, 3)];
  if (sorted.length === 2) return [sorted.slice(0, 1), sorted.slice(1, 2)];
  return [sorted];
}

export default function CampoFormacao({ times, onJogadorClick }) {
  if (!times || times.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {times.map((time, ti) => (
        <MiniCampo key={ti} time={time} teamIndex={ti} onJogadorClick={onJogadorClick} />
      ))}
    </div>
  );
}

function MiniCampo({ time, teamIndex, onJogadorClick }) {
  const style = TEAM_STYLES[teamIndex] || TEAM_STYLES[0];
  const nomes = ['Azul', 'Vermelho', 'Amarelo'];
  const linhas = distribuirFormacao(time.jogadores_detalhes);

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
        <span className="text-white/70 text-xs font-bold">{time.jogadores_detalhes.length} jogadores</span>
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
        <div className="relative flex flex-col justify-between py-6 px-3" style={{ minHeight: '260px' }}>
          {linhas.map((linha, li) => (
            <div key={li} className="flex justify-center gap-4">
              {linha.map((j, ji) => (
                <motion.div
                  key={j.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + (li * 0.1) + (ji * 0.05), type: 'spring', stiffness: 300, damping: 18 }}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                  onClick={() => onJogadorClick?.(j.id)}
                >
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
          ))}
        </div>
      </div>
    </motion.div>
  );
}
