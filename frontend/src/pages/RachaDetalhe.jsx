import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import Avatar from '../components/Avatar';
import CampoFormacao from '../components/CampoFormacao';
import { useGroupRole } from '../services/useGroupRole';
import { useAuth } from '../services/AuthContext';
import { getRacha, confirmarPresenca, cancelarPresenca, getPagamentoStatus, sortearTimes } from '../services/api';

export default function RachaDetalhe() {
  const { grupoId, id } = useParams();
  const navigate = useNavigate();
  const basePath = `/g/${grupoId}`;
  const { isAdmin, isMembro, membroId, penalizado } = useGroupRole(grupoId);
  const { isLoggedIn } = useAuth();
  const [racha, setRacha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('confirmados');
  const [confirmando, setConfirmando] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [sorteando, setSorteando] = useState(false);

  function carregar() {
    return getRacha(grupoId, id).then(d => setRacha(d)).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => { carregar(); }, [grupoId, id]);

  const jaPagou = racha?.confirmados?.some(c => c.membro_id === membroId);
  const jaPendente = racha?.pendentes?.some(c => c.membro_id === membroId);

  // Polling: se pendente, checa a cada 5s se pagou
  useEffect(() => {
    if (!jaPendente || !isMembro) return;
    const interval = setInterval(async () => {
      try {
        const data = await getPagamentoStatus(grupoId, id);
        if (data?.status === 'pago') {
          setPixData(null);
          await carregar();
          clearInterval(interval);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [jaPendente, isMembro, grupoId, id]);

  async function handleConfirmar() {
    setConfirmando(true);
    try {
      const result = await confirmarPresenca(grupoId, id);
      if (result?.qr_code) {
        setPixData(result);
      }
      await carregar();
    } catch (err) { alert(err.message); }
    finally { setConfirmando(false); }
  }

  async function handleCancelar() {
    setConfirmando(true);
    try {
      await cancelarPresenca(grupoId, id);
      setPixData(null);
      await carregar();
    } catch (err) { alert(err.message); }
    finally { setConfirmando(false); }
  }

  function copiarPix() {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!racha) return <div className="text-center py-20 text-gray-400">Racha nao encontrado</div>;

  const dataObj = new Date(racha.data);
  const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const horario = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const isFinalizado = racha.status === 'finalizado';

  const tabs = [
    { id: 'confirmados', label: `Jogadores (${racha.total_confirmados || 0})` },
    ...(racha.times ? [{ id: 'times', label: 'Times' }] : []),
    ...(racha.estatisticas?.length > 0 ? [{ id: 'stats', label: 'Estatisticas' }] : []),
    ...(isAdmin && !racha.times && racha.status === 'aberto' ? [{ id: 'sortear', label: 'Sortear Times' }] : []),
    ...(isAdmin && isFinalizado ? [{ id: 'penalidades', label: 'Penalidades' }] : []),
  ];

  // Formatar times para CampoFormacao
  const timesFormatados = racha.times?.map(t => {
    const jogadores_detalhes = t.jogadores.map(j => ({
      id: j.membro_id,
      nome: j.nome,
      apelido: j.apelido,
      posicao: j.posicao,
      nota: j.nota || 5,
    }));
    const soma = jogadores_detalhes.reduce((acc, j) => acc + j.nota, 0);
    return {
      ...t,
      jogadores_detalhes,
      soma_notas: soma,
      media_notas: jogadores_detalhes.length > 0 ? (soma / jogadores_detalhes.length).toFixed(1) : '0',
    };
  });

  return (
    <PageTransition>
      <div className="px-5 md:px-10 lg:px-12 pt-6 lg:pt-12 pb-28 lg:pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition mb-6">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          <span className="text-sm font-semibold">Voltar</span>
        </button>

        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-12">
              {penalizado && racha.status === 'aberto' ? (
                <>
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 bg-red-100 text-red-600">
                    Bloqueado
                  </span>
                  <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-400 leading-[0.9] mb-2">Racha agendado</h1>
                  <p className="text-gray-400 font-medium text-lg">Data e horario ocultos</p>
                  <div className="mt-6 bg-red-50 rounded-2xl p-5 border border-red-200">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                      <div>
                        <p className="font-bold text-red-700 text-sm">Voce esta penalizado</p>
                        <p className="text-red-500 text-xs">Nao e possivel confirmar presenca ou ver detalhes deste racha.</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
              <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 ${isFinalizado ? 'bg-gray-100 text-gray-500' : 'bg-lime-500 text-white'}`}>
                {racha.status}
              </span>
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 capitalize leading-[0.9] mb-2">{diaSemana}</h1>
              <p className="text-gray-400 font-medium text-lg">{dataFormatada}</p>
              <p className="text-gray-500">{horario} &middot; {racha.local}</p>

              {isFinalizado && racha.custo_campo && (
                <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Campo</p>
                      <p className="font-display text-2xl font-bold text-gray-800">R${racha.custo_campo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arrecadado</p>
                      <p className="font-display text-2xl font-bold text-lime-600">R${(racha.total_confirmados || 0) * racha.valor_por_pessoa}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 bg-lime-50 rounded-2xl p-5 border border-lime-100">
                <div className="flex items-end justify-between mb-2">
                  <p className="font-display text-4xl font-bold text-lime-700">{racha.total_confirmados || 0}</p>
                  <p className="text-sm text-lime-600 font-semibold">/18 confirmados</p>
                </div>
                <div className="h-2 bg-lime-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-lime-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((racha.total_confirmados || 0) / 18) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
                </div>
              </div>

              {/* Confirmar / Pagar / Cancelar presenca */}
              {racha.status === 'aberto' && isMembro && (
                <div className="mt-5 space-y-4">
                  {jaPagou ? (
                    <div className="bg-lime-50 border border-lime-200 rounded-2xl p-4 text-center">
                      <svg className="w-8 h-8 text-lime-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="font-bold text-lime-700">Presenca confirmada e paga!</p>
                    </div>
                  ) : jaPendente || pixData ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                      <div className="text-center">
                        <p className="font-bold text-gray-900 mb-1">Pague via Pix para confirmar</p>
                        <p className="text-sm text-gray-400">R${racha.valor_por_pessoa?.toFixed(2)}</p>
                      </div>

                      {pixData?.qr_code_base64 && (
                        <div className="flex justify-center">
                          <div className="bg-white p-3 rounded-xl border border-gray-100">
                            <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" className="w-48 h-48" />
                          </div>
                        </div>
                      )}

                      {pixData?.qr_code && (
                        <button onClick={copiarPix}
                          className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all"
                        >
                          {copiado ? (
                            <><svg className="w-4 h-4 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> Copiado!</>
                          ) : (
                            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg> Copiar codigo Pix</>
                          )}
                        </button>
                      )}

                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        <p className="text-sm font-medium">Aguardando pagamento...</p>
                      </div>

                      <button onClick={handleCancelar} disabled={confirmando}
                        className="w-full text-red-500 text-sm font-semibold py-2 hover:text-red-600 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button onClick={handleConfirmar} disabled={confirmando}
                      className="w-full bg-lime-500 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-lime-600 active:scale-[0.98] transition-all shadow-lg shadow-lime-500/20"
                    >
                      {confirmando ? 'Gerando Pix...' : `Confirmar presenca · R$${racha.valor_por_pessoa?.toFixed(0) || 20}`}
                    </button>
                  )}
                </div>
              )}

              {racha.status === 'aberto' && isLoggedIn && !isMembro && (
                <p className="mt-5 text-center text-sm text-gray-400">Entre no grupo para confirmar presenca</p>
              )}
                </>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${tab === t.id ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'confirmados' && (
                <motion.div key="confirmados" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(racha.confirmados || []).map((j, i) => (
                      <motion.div key={j.membro_id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Link to={`${basePath}/jogador/${j.membro_id}`}>
                          <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]">
                            <div className="flex items-center gap-3">
                              <Avatar nome={j.nome} size="md" />
                              <div>
                                <p className="font-semibold text-gray-800">{j.apelido || j.nome}</p>
                                <p className="text-[11px] text-gray-400">{j.posicao}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAdmin && <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full">{j.nota || 5}</span>}
                              <span className="bg-lime-100 text-lime-700 text-[10px] font-bold px-2.5 py-1 rounded-full">Pago</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  {(racha.pendentes || []).length > 0 && (
                    <div className="mt-6">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Pendentes</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {racha.pendentes.map((j) => (
                          <Link key={j.membro_id} to={`${basePath}/jogador/${j.membro_id}`}>
                            <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between border border-gray-100 opacity-60 hover:opacity-80 transition">
                              <div className="flex items-center gap-3">
                                <Avatar nome={j.nome} size="md" />
                                <p className="font-semibold text-gray-600">{j.apelido || j.nome}</p>
                              </div>
                              <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-full">Pendente</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'times' && timesFormatados && (
                <motion.div key="times" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <CampoFormacao times={timesFormatados} onJogadorClick={(id) => navigate(`${basePath}/jogador/${id}`)} isAdmin={isAdmin} />
                </motion.div>
              )}

              {tab === 'stats' && (
                <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50"><h3 className="font-display font-bold text-gray-900">Artilheiros</h3></div>
                    {(racha.estatisticas || []).filter(e => e.gols > 0).map((e, i) => (
                      <Link key={e.membro_id} to={`${basePath}/jogador/${e.membro_id}`}>
                        <div className={`flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                          <div className="flex items-center gap-4">
                            <span className="w-8 text-center font-display font-bold text-gray-300 text-lg">{i + 1}</span>
                            <Avatar nome={e.nome} size="md" />
                            <div>
                              <span className="font-semibold text-gray-800">{e.apelido || e.nome}</span>
                              <p className="text-[11px] text-gray-400">{e.posicao}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-5">
                            <div className="text-center"><span className="font-display font-black text-xl text-gray-900">{e.gols}</span><p className="text-[9px] text-gray-400 font-bold uppercase">Gols</p></div>
                            <div className="text-center"><span className="font-display font-black text-xl text-gray-300">{e.assistencias}</span><p className="text-[9px] text-gray-400 font-bold uppercase">Asst</p></div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === 'sortear' && (
                <motion.div key="sortear" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8 text-center">
                    <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg>
                    </div>
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Sortear times</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">{racha.total_confirmados || 0} jogadores confirmados.</p>
                    <button
                      onClick={async () => {
                        setSorteando(true);
                        try {
                          await sortearTimes(grupoId, id);
                          await carregar();
                          setTab('times');
                        } catch (err) { alert(err.message); }
                        finally { setSorteando(false); }
                      }}
                      disabled={sorteando}
                      className="bg-lime-500 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-lime-600 active:scale-[0.98] transition-all shadow-lg shadow-lime-500/20 disabled:opacity-50"
                    >
                      {sorteando ? 'Sorteando...' : 'Sortear agora'}
                    </button>
                  </div>
                </motion.div>
              )}

              {tab === 'penalidades' && (
                <motion.div key="penalidades" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm mb-2">Selecione um jogador para aplicar penalidade:</p>
                    {(racha.confirmados || []).map((j, i) => (
                      <motion.div key={j.membro_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all">
                          <div className="flex items-center gap-3">
                            <Avatar nome={j.nome} size="md" />
                            <div>
                              <p className="font-semibold text-gray-800">{j.apelido || j.nome}</p>
                              <p className="text-[11px] text-gray-400">{j.posicao}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition">Advertir</button>
                            <button className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition">Suspender</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
