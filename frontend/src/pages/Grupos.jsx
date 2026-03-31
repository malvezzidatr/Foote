import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import LoginButton from '../components/LoginButton';
import UserMenu from '../components/UserMenu';
import { useAuth } from '../services/AuthContext';
import { getGrupos, criarGrupo } from '../services/api';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const COR_MAP = {
  lime: { bg: 'bg-lime-500', text: 'text-lime-700' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-700' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-700' },
  red: { bg: 'bg-red-500', text: 'text-red-700' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-700' },
};

export default function Grupos() {
  const { isLoggedIn } = useAuth();
  const [showCriar, setShowCriar] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGrupos()
      .then(data => setGrupos(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleGrupoCriado() {
    setShowCriar(false);
    getGrupos().then(data => setGrupos(data || [])).catch(() => {});
  }

  return (
    <PageTransition>
      <div className="min-h-screen px-5 md:px-10 lg:px-20 xl:px-32 pt-6 lg:pt-10 pb-20">
        {/* Top bar */}
        <div className="flex items-center justify-end mb-4 gap-3">
          {isLoggedIn ? <UserMenu /> : <LoginButton onSuccess={() => {}} />}
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="mb-12 lg:mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <span className="text-sm font-bold text-lime-600 uppercase tracking-[0.2em]">Racha FC</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.85] tracking-tighter text-gray-900">
              DESCUBRA<br /><span className="text-lime-500">GRUPOS</span>
            </h1>
            <p className="text-gray-400 text-lg mt-3 max-w-md">Encontre um racha perto de voce ou crie o seu proprio grupo.</p>
          </div>
          {isLoggedIn && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCriar(true)}
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-base flex items-center gap-3 hover:bg-gray-800 transition shadow-lg shadow-gray-900/10 self-start lg:self-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Criar novo grupo
            </motion.button>
          )}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {grupos.map((grupo) => (
              <GrupoCard key={grupo.id} grupo={grupo} />
            ))}
            {isLoggedIn && (
              <motion.div variants={fadeUp}>
                <button onClick={() => setShowCriar(true)}
                  className="w-full h-full min-h-[220px] rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-lime-400 hover:text-lime-600 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-gray-200 group-hover:border-lime-400 flex items-center justify-center transition-all">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </div>
                  <span className="font-bold text-sm">Criar grupo</span>
                </button>
              </motion.div>
            )}
            {!isLoggedIn && grupos.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">Nenhum grupo criado ainda. Faca login para criar o primeiro!</div>
            )}
          </motion.div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showCriar && <CriarGrupoModal onClose={() => setShowCriar(false)} onCreated={handleGrupoCriado} />}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

function GrupoCard({ grupo }) {
  const cor = COR_MAP[grupo.cor] || COR_MAP.lime;
  const proximoRacha = grupo.proximo_racha ? new Date(grupo.proximo_racha) : null;

  return (
    <motion.div variants={fadeUp}>
      <Link to={`/g/${grupo.id}`}>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 active:scale-[0.98] group h-full">
          <div className="flex items-start justify-between mb-5">
            <div className={`w-12 h-12 ${cor.bg} rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg`}>
              {grupo.nome.charAt(0)}
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{grupo.membros || 0} membros</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-1 group-hover:text-lime-600 transition-colors">{grupo.nome}</h3>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{grupo.descricao}</p>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <div>
              {proximoRacha ? (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cor.bg} animate-pulse`} />
                  <span className="text-xs font-semibold text-gray-500">
                    Proximo: {proximoRacha.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-300 font-medium">Sem racha agendado</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${cor.text}`}>R${grupo.valor_padrao || 20}/pessoa</span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-lime-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CriarGrupoModal({ onClose, onCreated }) {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [valor, setValor] = useState('20');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim()) return setErro('Nome obrigatorio');
    setLoading(true);
    setErro('');
    try {
      const grupo = await criarGrupo({ nome: nome.trim(), descricao: descricao.trim(), local_padrao: local.trim(), valor_padrao: Number(valor) || 20 });
      onCreated?.();
      navigate(`/g/${grupo.id}`);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="relative bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Criar novo grupo</h2>
        <p className="text-gray-400 text-sm mb-6">Preencha as informacoes do seu racha</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Nome do grupo</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Racha da Quinta" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Descricao</label>
            <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Futebol toda quinta as 20h" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Local</label>
              <input type="text" value={local} onChange={e => setLocal(e.target.value)} placeholder="Arena Society" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Valor/pessoa</label>
              <input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="20" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition" />
            </div>
          </div>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <button type="submit" disabled={loading} className="w-full bg-lime-500 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-lime-600 active:scale-[0.98] transition-all shadow-lg shadow-lime-500/20 mt-2">
            {loading ? 'Criando...' : 'Criar grupo'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
