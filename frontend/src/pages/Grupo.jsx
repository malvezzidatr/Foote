import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import Avatar from '../components/Avatar';
import { getMembros } from '../services/api';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Grupo() {
  const { grupoId } = useParams();
  const basePath = `/g/${grupoId}`;
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMembros(grupoId)
      .then(d => setMembros(d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [grupoId]);

  const sorted = [...membros].sort((a, b) => b.gols - a.gols || b.jogos - a.jogos);
  const top3 = sorted.slice(0, 3);

  if (loading) {
    return <div className="flex justify-center py-32"><div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <PageTransition>
      <div className="px-5 md:px-10 lg:px-12 pt-8 lg:pt-12 pb-28 lg:pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-10">
          <p className="text-sm font-bold text-lime-600 uppercase tracking-[0.2em] mb-3">Elenco</p>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.85] tracking-tighter text-gray-900">JOGADORES</h1>
          <p className="text-gray-400 text-lg mt-2">{sorted.length} jogadores ativos no grupo</p>
        </motion.div>

        {/* Top 3 artilheiros */}
        {top3.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }} className="grid grid-cols-3 gap-4 lg:gap-6 mb-10">
            {[top3[1], top3[0], top3[2]].map((j, i) => {
              const heights = ['h-28 lg:h-36', 'h-36 lg:h-44', 'h-24 lg:h-32'];
              const place = [2, 1, 3][i];
              return (
                <Link key={j.membro_id} to={`${basePath}/jogador/${j.membro_id}`} className="group">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${place === 1 ? 'bg-amber-400' : place === 2 ? 'bg-gray-300' : 'bg-amber-600'}`}>
                      <span className="text-white font-display font-black text-sm">{place}</span>
                    </div>
                    <Avatar nome={j.nome} size="lg" className="group-hover:scale-105 transition-transform ring-4 ring-lime-100" />
                    <p className="font-bold text-gray-800 mt-3 text-sm lg:text-base">{j.apelido || j.nome}</p>
                    <p className="text-xs text-gray-400">{j.gols} gols &middot; {j.posicao}</p>
                    <div className={`${heights[i]} w-full ${place === 1 ? 'bg-lime-200' : 'bg-lime-100'} rounded-t-2xl mt-3 flex items-end justify-center pb-3`}>
                      <span className="font-display font-black text-3xl lg:text-4xl text-lime-700">{place}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        )}

        {/* Full list */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((j, i) => (
            <motion.div key={j.membro_id} variants={fadeUp}>
              <Link to={`${basePath}/jogador/${j.membro_id}`}>
                <div className={`bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between border transition-all active:scale-[0.98] hover:shadow-md group ${j.penalidade_ativa ? 'border-red-200 bg-red-50/50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-display font-bold text-gray-300 text-sm">{i + 1}</span>
                    <Avatar nome={j.nome} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-gray-800">{j.apelido || j.nome}</p>
                        {j.penalidade_ativa && (
                          <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">{j.posicao} &middot; {j.jogos} jogos &middot; {j.gols} gols</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-lime-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </div>
              </Link>
            </motion.div>
          ))}
          {sorted.length === 0 && <p className="col-span-full text-center py-16 text-gray-400">Nenhum membro ainda.</p>}
        </motion.div>
      </div>
    </PageTransition>
  );
}
