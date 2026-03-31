import { useState, useEffect } from 'react';
import { getMpStatus, getMpOAuthUrl, disconnectMp } from '../services/api';

export default function MpConnectButton({ grupoId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMpStatus(grupoId)
      .then(d => setStatus(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [grupoId]);

  async function handleConnect() {
    try {
      const data = await getMpOAuthUrl(grupoId);
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectMp(grupoId);
      setStatus({ connected: false });
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return null;

  if (status?.connected) {
    return (
      <div className="bg-lime-50 border border-lime-200 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-bold text-lime-700">Mercado Pago conectado</span>
        </div>
        <button onClick={handleDisconnect} className="text-[10px] text-gray-400 hover:text-red-500 transition font-medium">
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="w-full bg-[#009ee3] text-white rounded-xl px-3 py-2.5 text-xs font-bold flex items-center gap-2 hover:bg-[#0084c1] transition active:scale-[0.98]"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      Conectar Mercado Pago
    </button>
  );
}
