import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import Avatar from '../components/Avatar';
import StatBadge from '../components/StatBadge';
import { getMembroPerfil, atualizarNota, criarPenalidade } from '../services/api';
import { useGroupRole } from '../services/useGroupRole';

export default function Jogador() {
  const { grupoId, id } = useParams();
  const navigate = useNavigate();
  const basePath = `/g/${grupoId}`;
  const { isAdmin } = useGroupRole(grupoId);
  const [jogador, setJogador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState(5);
  const [savingNota, setSavingNota] = useState(false);
  const [showPenalidade, setShowPenalidade] = useState(false);

  function carregar() {
    return getMembroPerfil(grupoId, id)
      .then(d => { setJogador(d); setNota(d?.nota || 5); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { carregar(); }, [grupoId, id]);

  async function handleNota(newNota) {
    setNota(newNota);
    setSavingNota(true);
    try { await atualizarNota(grupoId, id, newNota); } catch {}
    finally { setSavingNota(false); }
  }

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

              {isAdmin && (
                <div className="mt-6 space-y-3">
                  {/* Nota de habilidade */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Nota de habilidade</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range" min="1" max="10" step="1" value={nota}
                        onChange={e => handleNota(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-lime-500"
                      />
                      <span className={`font-display text-2xl font-bold w-8 text-center ${savingNota ? 'text-gray-300' : 'text-lime-600'}`}>{nota}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-gray-400">1</span>
                      <span className="text-[9px] text-gray-400">10</span>
                    </div>
                  </div>

                  {/* Penalizar */}
                  <button
                    onClick={() => setShowPenalidade(true)}
                    className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-2xl font-bold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                    Penalizar jogador
                  </button>
                </div>
              )}
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

      <AnimatePresence>
        {showPenalidade && (
          <PenalidadeModal
            grupoId={grupoId}
            membroId={id}
            nomeJogador={jogador.apelido || jogador.nome}
            onClose={() => setShowPenalidade(false)}
            onCreated={() => { setShowPenalidade(false); carregar(); }}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

function PenalidadeModal({ grupoId, membroId, nomeJogador, onClose, onCreated }) {
  const [tipo, setTipo] = useState('advertencia');
  const [motivo, setMotivo] = useState('');
  const [duracao, setDuracao] = useState('');
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!motivo.trim()) return setErro('Motivo obrigatorio');
    setLoading(true);
    try {
      await criarPenalidade(grupoId, membroId, {
        tipo,
        motivo,
        duracao: tipo === 'suspensao' ? duracao : undefined,
        valor: tipo === 'multa' ? Number(valor) : undefined,
      });
      onCreated?.();
    } catch (err) { setErro(err.message); }
    finally { setLoading(false); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="relative bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Penalizar jogador</h2>
        <p className="text-gray-400 text-sm mb-6">Aplicar penalidade para {nomeJogador}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Tipo</label>
            <div className="flex gap-2">
              {[
                { value: 'advertencia', label: 'Advertencia', color: 'amber' },
                { value: 'suspensao', label: 'Suspensao', color: 'red' },
                { value: 'multa', label: 'Multa', color: 'red' },
              ].map(t => (
                <button key={t.value} type="button" onClick={() => setTipo(t.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${tipo === t.value ? `bg-${t.color}-100 text-${t.color}-700 border-2 border-${t.color}-300` : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Motivo</label>
            <input type="text" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ex: Briga em campo"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 transition" />
          </div>
          {tipo === 'suspensao' && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Duracao</label>
              <select value={duracao} onChange={e => setDuracao(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
              >
                <option value="">Selecione</option>
                <option value="1 semana">1 semana</option>
                <option value="2 semanas">2 semanas</option>
                <option value="3 semanas">3 semanas</option>
                <option value="4 semanas">4 semanas</option>
              </select>
            </div>
          )}
          {tipo === 'multa' && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Valor (R$)</label>
              <input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="20"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500/50 transition" />
            </div>
          )}
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-red-500 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-red-600 active:scale-[0.98] transition-all shadow-lg shadow-red-500/20"
          >
            {loading ? 'Aplicando...' : 'Aplicar penalidade'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
