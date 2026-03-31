import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { caixinha, rachas, jogadores } from '../data/mock';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const menuItems = [
  { icon: '📅', title: 'Criar Racha', desc: 'Agendar proximo jogo' },
  { icon: '👥', title: 'Gerenciar Jogadores', desc: 'Adicionar, editar notas e posicoes' },
  { icon: '🏆', title: 'Registrar Estatisticas', desc: 'Gols, assistencias por racha' },
  { icon: '🟥', title: 'Penalidades', desc: 'Suspensoes, multas, advertencias' },
  { icon: '🎲', title: 'Sortear Times', desc: 'Gerar times equilibrados' },
  { icon: '💸', title: 'Custo do Campo', desc: 'Informar valor e finalizar racha' },
];

export default function Admin() {
  return (
    <PageTransition>
      <div className="px-5 md:px-10 lg:px-12 pt-8 lg:pt-12 pb-28 lg:pb-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-10">
          <p className="text-sm font-bold text-lime-600 uppercase tracking-[0.2em] mb-3">Painel</p>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.85] tracking-tighter text-gray-900">
            ADMIN
          </h1>
        </motion.div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Coluna esquerda: acoes */}
          <div className="lg:col-span-2 mb-8 lg:mb-0">
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {menuItems.map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <div className="bg-white rounded-2xl px-5 py-5 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group">
                    <span className="text-3xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-lime-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Coluna direita: resumo */}
          <div className="lg:col-span-1 space-y-5">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {/* Caixinha */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-gray-900">Caixinha</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo</span>
                </div>
                <p className="font-display text-5xl font-bold text-lime-600 mb-4">R${caixinha.saldo.toFixed(0)}</p>
                <div className="space-y-2">
                  {caixinha.historico.slice(0, 3).map((h) => (
                    <div key={h.id} className="flex items-center justify-between py-1 text-sm">
                      <span className="text-gray-500 truncate mr-3">{h.descricao}</span>
                      <span className={`font-bold whitespace-nowrap ${h.tipo === 'entrada' ? 'text-lime-600' : 'text-red-500'}`}>
                        {h.tipo === 'entrada' ? '+' : '-'}R${Math.abs(h.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-lime-100 rounded-2xl p-5">
                  <p className="font-display text-3xl font-bold text-lime-700">{jogadores.filter(j => j.ativo).length}</p>
                  <p className="text-xs font-bold text-lime-600 mt-1">Jogadores</p>
                </div>
                <div className="bg-gray-100 rounded-2xl p-5">
                  <p className="font-display text-3xl font-bold text-gray-700">{rachas.length}</p>
                  <p className="text-xs font-bold text-gray-500 mt-1">Rachas</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
