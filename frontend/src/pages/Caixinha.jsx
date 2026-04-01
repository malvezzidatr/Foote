import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import { getCaixinha } from '../services/api';

export default function Caixinha() {
  const { grupoId } = useParams();
  const [caixinha, setCaixinha] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCaixinha(grupoId)
      .then(d => setCaixinha(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [grupoId]);

  if (loading) {
    return <div className="flex justify-center py-32"><div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!caixinha) {
    return <div className="flex justify-center py-32 text-gray-400">Erro ao carregar caixinha</div>;
  }

  const historico = caixinha.historico || [];

  return (
    <PageTransition>
      <div className="px-5 md:px-10 lg:px-12 pt-8 lg:pt-12 pb-28 lg:pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-10 lg:mb-14">
          <p className="text-sm font-bold text-lime-600 uppercase tracking-[0.2em] mb-3">Financeiro</p>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.85] tracking-tighter text-gray-900">
            CAIXINHA
          </h1>
        </motion.div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-gray-100"
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo atual</p>
            <p className={`font-display text-4xl font-bold ${caixinha.saldo >= 0 ? 'text-lime-600' : 'text-red-500'}`}>
              R${caixinha.saldo.toFixed(2)}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-lime-50 rounded-3xl p-6 border border-lime-100"
          >
            <p className="text-[10px] font-bold text-lime-600 uppercase tracking-widest mb-1">Entradas</p>
            <p className="font-display text-4xl font-bold text-lime-700">R${caixinha.entradas.toFixed(2)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-red-50 rounded-3xl p-6 border border-red-100"
          >
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Saidas</p>
            <p className="font-display text-4xl font-bold text-red-500">R${caixinha.saidas.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Historico completo */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-5">Historico</h2>
          {historico.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-gray-100 text-center">
              <p className="text-gray-400 text-lg">Nenhuma movimentacao registrada.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {historico.map((h, i) => {
                const data = h.created_at ? new Date(h.created_at) : null;
                return (
                  <motion.div key={h.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * Math.min(i, 10) }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${h.tipo === 'entrada' ? 'bg-lime-100' : 'bg-red-100'}`}>
                        {h.tipo === 'entrada' ? (
                          <svg className="w-5 h-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" /></svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" /></svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{h.descricao}</p>
                        {data && (
                          <p className="text-xs text-gray-400">
                            {data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })} às {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-base font-bold whitespace-nowrap ml-4 ${h.tipo === 'entrada' ? 'text-lime-600' : 'text-red-500'}`}>
                      {h.tipo === 'entrada' ? '+' : '-'}R${Math.abs(h.valor).toFixed(2)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
