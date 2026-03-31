import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import Avatar from '../components/Avatar';
import StatBadge from '../components/StatBadge';
import { getMembroPerfil } from '../services/api';

export default function Jogador() {
  const { grupoId, id } = useParams();
  const navigate = useNavigate();
  const basePath = `/g/${grupoId}`;
  const [jogador, setJogador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMembroPerfil(grupoId, id)
      .then(d => setJogador(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [grupoId, id]);

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!jogador) return <div className="text-center py-20 text-gray-400">Jogador nao encontrado</div>;

  return (
    <PageTransition>
      <div className="px-5 md:px-10 lg:px-12 pt-6 lg:pt-12 pb-28 lg:pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition mb-8">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          <span className="text-sm font-semibold">Voltar</span>
        </button>

        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-12">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}>
                  {jogador.foto ? (
                    <img src={jogador.foto} alt="" className="w-20 h-20 rounded-full ring-4 ring-lime-200" referrerPolicy="no-referrer" />
                  ) : (
                    <Avatar nome={jogador.nome} size="xl" className="ring-4 ring-lime-200" />
                  )}
                </motion.div>
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mt-4">{jogador.nome}</h1>
                {jogador.apelido && <p className="text-gray-400 font-medium text-lg">@{jogador.apelido.toLowerCase()}</p>}
                <div className="flex items-center gap-2 mt-3 flex-wrap justify-center lg:justify-start">
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">{jogador.posicao}</span>
                  {jogador.penalidade_ativa && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                      Penalizado
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <StatBadge icon="gols" label="Gols" value={jogador.gols} color="lime" />
                <StatBadge icon="assist" label="Assist." value={jogador.assistencias} color="blue" />
                <StatBadge icon="jogos" label="Jogos" value={jogador.jogos} color="gray" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatBadge icon="media" label="Media" value={jogador.media_gols} color="lime" />
                <StatBadge icon="calotes" label="Calotes" value={jogador.calotes} color={jogador.calotes > 0 ? 'red' : 'gray'} />
                <StatBadge icon="penalidades" label="Penalid." value={jogador.penalidades?.length || 0} color={jogador.penalidades?.length > 0 ? 'red' : 'gray'} />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            {jogador.ultimo_jogo && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-lime-50 rounded-2xl px-6 py-5 mb-6 border border-lime-100">
                <p className="text-[10px] font-bold text-lime-600 uppercase tracking-widest mb-1">Ultimo jogo</p>
                <p className="font-semibold text-gray-800 text-lg">
                  {new Date(jogador.ultimo_jogo).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </p>
              </motion.div>
            )}

            {jogador.penalidades?.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-8">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Penalidades</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {jogador.penalidades.map((p) => (
                    <div key={p.id} className={`rounded-2xl px-5 py-4 border ${p.ativa ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-800 capitalize">{p.tipo}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${p.ativa ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-500'}`}>
                          {p.ativa ? 'Ativa' : 'Cumprida'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{p.motivo}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                        {p.duracao && ` · ${p.duracao}`}
                        {p.valor && ` · R$${p.valor}`}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Historico de rachas</p>
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                {(!jogador.historico || jogador.historico.length === 0) && (
                  <p className="text-gray-400 text-sm text-center py-8">Nenhum racha no historico.</p>
                )}
                {jogador.historico?.map((r, i) => {
                  const dataObj = new Date(r.data);
                  return (
                    <Link key={r.id} to={`${basePath}/racha/${r.id}`}>
                      <div className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-50 rounded-xl w-12 h-12 flex flex-col items-center justify-center border border-gray-100">
                            <span className="font-display font-bold text-gray-700 text-sm leading-none">{dataObj.toLocaleDateString('pt-BR', { day: '2-digit' })}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase">{dataObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{r.local}</p>
                            <p className="text-xs text-gray-400">{r.total_jogadores} jogadores</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 text-sm font-bold">
                            {r.gols_racha > 0 && <span className="text-gray-700">{r.gols_racha}g</span>}
                            {r.assists_racha > 0 && <span className="text-gray-400">{r.assists_racha}a</span>}
                          </div>
                          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
