import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import { useGroupRole } from '../services/useGroupRole';
import { useAuth } from '../services/AuthContext';
import { getRachas, getCaixinha, criarRacha, entrarGrupo, getMpStatus } from '../services/api';
import MpConnectButton from '../components/MpConnectButton';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

export default function GrupoHome() {
  const { grupoId } = useParams();
  const { isLoggedIn } = useAuth();
  const { isAdmin, isMembro, penalizado, loaded: roleLoaded } = useGroupRole(grupoId);
  const basePath = `/g/${grupoId}`;
  const [showCriar, setShowCriar] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [rachas, setRachas] = useState([]);
  const [caixinha, setCaixinha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mpConnected, setMpConnected] = useState(false);

  function carregar() {
    Promise.all([
      getRachas(grupoId).then(d => setRachas(d || [])),
      getCaixinha(grupoId).then(d => setCaixinha(d)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => { carregar(); }, [grupoId]);

  useEffect(() => {
    if (isAdmin) {
      getMpStatus(grupoId).then(d => setMpConnected(d?.connected)).catch(() => {});
    }
  }, [grupoId, isAdmin]);

  const proximos = rachas.filter(r => r.status === 'aberto').sort((a, b) => new Date(a.data) - new Date(b.data));
  const passados = rachas.filter(r => r.status === 'finalizado').sort((a, b) => new Date(b.data) - new Date(a.data));

  if (loading) {
    return <div className="flex justify-center py-32"><div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <PageTransition>
      <div className="px-5 md:px-10 lg:px-12 pt-8 lg:pt-12 pb-28 lg:pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-10 lg:mb-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-lime-600 uppercase tracking-[0.2em] mb-3">Rachas</p>
              <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.85] tracking-tighter text-gray-900">
                PROXIMOS<br /><span className="text-lime-500">RACHAS</span>
              </h1>
            </div>
            {isAdmin && (
              <div className="flex flex-col gap-3 self-start">
                <motion.button whileHover={mpConnected ? { scale: 1.02 } : {}} whileTap={mpConnected ? { scale: 0.98 } : {}}
                  onClick={() => mpConnected ? setShowCriar(true) : null}
                  disabled={!mpConnected}
                  className={`px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition shadow-lg self-start ${mpConnected ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/10' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Criar racha
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Entrar no grupo */}
        {roleLoaded && isLoggedIn && !isMembro && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="bg-lime-50 border border-lime-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-800">Voce ainda nao e membro deste grupo</p>
                <p className="text-sm text-gray-500">Entre para confirmar presenca nos rachas</p>
              </div>
              <button
                onClick={async () => {
                  setEntrando(true);
                  try {
                    await entrarGrupo(grupoId, {});
                    window.location.reload();
                  } catch (err) { alert(err.message); }
                  finally { setEntrando(false); }
                }}
                disabled={entrando}
                className="bg-lime-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-lime-600 active:scale-[0.98] transition-all shadow-md shadow-lime-500/20 whitespace-nowrap"
              >
                {entrando ? 'Entrando...' : 'Entrar no grupo'}
              </button>
            </div>
          </motion.div>
        )}

        {isAdmin && !mpConnected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-800">Mercado Pago nao conectado</p>
                  <p className="text-sm text-gray-500">Conecte para receber pagamentos e criar rachas</p>
                </div>
                <MpConnectButton grupoId={grupoId} />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
            {proximos.map(r => <RachaCardLarge key={r.id} racha={r} basePath={basePath} penalizado={penalizado} />)}
            {proximos.length === 0 && (
              <div className="bg-white rounded-3xl p-10 border border-gray-100 text-center">
                <p className="text-gray-400 text-lg mb-4">Nenhum racha agendado.</p>
                {isAdmin && (
                  <button onClick={() => mpConnected && setShowCriar(true)} disabled={!mpConnected}
                    className={`px-5 py-3 rounded-2xl font-bold text-sm inline-flex items-center gap-2 transition shadow-lg ${mpConnected ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/10' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Criar racha
                  </button>
                )}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="space-y-5">
            {caixinha && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold text-gray-900">Caixinha</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo atual</span>
                </div>
                <p className="font-display text-5xl lg:text-6xl font-bold text-lime-600 mb-4">R${caixinha.saldo.toFixed(0)}</p>
                <div className="space-y-2 mb-4">
                  {(caixinha.historico || []).slice(0, 4).map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500 truncate mr-4">{h.descricao}</span>
                      <span className={`text-sm font-bold whitespace-nowrap ${h.tipo === 'entrada' ? 'text-lime-600' : 'text-red-500'}`}>
                        {h.tipo === 'entrada' ? '+' : '-'}R${Math.abs(h.valor)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Link to={`${basePath}/caixinha`} className="text-sm font-semibold text-lime-600 hover:text-lime-700 transition flex items-center gap-1">
                    Ver mais
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </Link>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-lime-100 rounded-3xl p-6">
                <p className="text-[10px] font-bold text-lime-600 uppercase tracking-widest mb-1">Rachas</p>
                <p className="font-display text-4xl font-bold text-lime-700">{rachas.length}</p>
              </div>
              <div className="bg-gray-100 rounded-3xl p-6">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Abertos</p>
                <p className="font-display text-4xl font-bold text-gray-700">{proximos.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {passados.length > 0 && (
          <div>
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Historico</motion.h2>
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {passados.map(r => <RachaCardSmall key={r.id} racha={r} basePath={basePath} />)}
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {showCriar && <CriarRachaModal grupoId={grupoId} onClose={() => setShowCriar(false)} onCreated={() => { setShowCriar(false); carregar(); }} />}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

function RachaCardLarge({ racha, basePath, penalizado }) {
  const dataObj = new Date(racha.data);
  const dia = dataObj.getDate();
  const mes = dataObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
  const horario = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const totalConf = racha.total_confirmados || 0;

  if (penalizado) {
    return (
      <motion.div variants={fadeUp}>
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-red-200 opacity-70">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Bloqueado</div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gray-100 rounded-2xl w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center border border-gray-200">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-gray-400">Racha agendado</p>
              <p className="text-gray-400 text-sm">Data e horario ocultos</p>
            </div>
          </div>
          <p className="text-red-500 text-sm font-semibold">Voce esta penalizado e nao pode participar deste racha.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp}>
      <Link to={`${basePath}/racha/${racha.id}`}>
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.99] group">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-lime-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Aberto</div>
            <span className="text-sm text-gray-400 font-medium">{racha.local}</span>
          </div>
          <div className="flex items-end gap-5 mb-6">
            <div className="bg-lime-50 rounded-2xl w-20 h-20 lg:w-24 lg:h-24 flex flex-col items-center justify-center border border-lime-100">
              <span className="font-display text-3xl lg:text-4xl font-bold text-lime-700 leading-none">{dia}</span>
              <span className="text-xs font-bold text-lime-500 uppercase">{mes}</span>
            </div>
            <div>
              <p className="font-display text-2xl lg:text-3xl font-bold text-gray-900 capitalize">{diaSemana}</p>
              <p className="text-gray-400 font-medium">{horario}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-semibold">{totalConf}/18 confirmados</span>
            <svg className="w-5 h-5 text-gray-300 group-hover:text-lime-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </div>
          <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-lime-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${(totalConf / 18) * 100}%` }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function RachaCardSmall({ racha, basePath }) {
  const dataObj = new Date(racha.data);
  const dia = dataObj.getDate();
  const mes = dataObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'short' });

  return (
    <motion.div variants={fadeUp}>
      <Link to={`${basePath}/racha/${racha.id}`}>
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-all active:scale-[0.98] group">
          <div className="bg-gray-50 rounded-xl w-14 h-14 flex flex-col items-center justify-center shrink-0 border border-gray-100">
            <span className="font-display text-lg font-bold text-gray-700 leading-none">{dia}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">{mes}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 capitalize truncate">{diaSemana} &middot; {racha.local}</p>
            <p className="text-xs text-gray-400">{racha.total_confirmados || 0} jogadores &middot; R${racha.custo_campo || '?'}</p>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-lime-500 transition shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </div>
      </Link>
    </motion.div>
  );
}

function CriarRachaModal({ grupoId, onClose, onCreated }) {
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [custo, setCusto] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!data) return setErro('Data obrigatoria');
    setLoading(true);
    try {
      await criarRacha(grupoId, { data, local: local || undefined, custo_campo: custo ? Number(custo) : undefined });
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
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Criar novo racha</h2>
        <p className="text-gray-400 text-sm mb-6">Defina a data e o custo do campo</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Data e horario</label>
            <input type="datetime-local" value={data} onChange={e => setData(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Local</label>
            <input type="text" value={local} onChange={e => setLocal(e.target.value)} placeholder="Usa o padrao do grupo se vazio" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Custo do campo (R$)</label>
            <input type="number" value={custo} onChange={e => setCusto(e.target.value)} placeholder="280" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition" />
          </div>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <button type="submit" disabled={loading} className="w-full bg-lime-500 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-lime-600 active:scale-[0.98] transition-all shadow-lg shadow-lime-500/20">
            {loading ? 'Criando...' : 'Criar racha'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
