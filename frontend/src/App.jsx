import { BrowserRouter, Routes, Route, NavLink, useLocation, useParams, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './services/AuthContext';
import UserMenu from './components/UserMenu';
import MpConnectButton from './components/MpConnectButton';
import Grupos from './pages/Grupos';
import GrupoHome from './pages/GrupoHome';
import Grupo from './pages/Grupo';
import RachaDetalhe from './pages/RachaDetalhe';
import Jogador from './pages/Jogador';
import Caixinha from './pages/Caixinha';
import { useState, useEffect } from 'react';
import { getGrupo } from './services/api';
import { useGroupRole } from './services/useGroupRole';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/* ─── Layout dentro de um grupo (sidebar + bottom nav) ─── */
function GrupoLayout() {
  const { grupoId } = useParams();
  const [grupo, setGrupo] = useState(null);
  const { isAdmin } = useGroupRole(grupoId);
  const basePath = `/g/${grupoId}`;

  useEffect(() => {
    getGrupo(grupoId).then(d => setGrupo(d)).catch(() => {});
  }, [grupoId]);

  const navItems = [
    {
      to: basePath, label: 'Rachas', end: true,
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
    },
    {
      to: `${basePath}/caixinha`, label: 'Caixinha',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
    },
    {
      to: `${basePath}/elenco`, label: 'Elenco',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 z-40">
        <div className="px-7 pt-8 pb-2">
          <NavLink to="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition text-sm font-semibold mb-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Meus grupos
          </NavLink>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg">
              {grupo?.nome?.charAt(0) || 'R'}
            </div>
            <div>
              <p className="font-display font-bold text-base leading-tight text-gray-900">{grupo?.nome || 'Grupo'}</p>
              <p className="text-[11px] text-gray-400 font-medium">{grupo?.total_membros || 0} membros</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 mt-6">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive ? 'bg-lime-50 text-lime-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        {isAdmin && (
          <div className="px-4 pb-3">
            <MpConnectButton grupoId={grupoId} />
          </div>
        )}
        <div className="px-5 py-5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-300 font-medium">R${grupo?.valor_padrao || 20}/pessoa</p>
          <UserMenu />
        </div>
      </aside>

      {/* Content */}
      <div className="lg:ml-64">
        <Outlet />
      </div>

      {/* Bottom nav mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="px-4 pb-2">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-gray-200/50">
            <div className="flex items-center justify-around py-2">
              {navItems.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-xl transition-all ${
                      isActive ? 'text-lime-600' : 'text-gray-400'
                    }`
                  }
                >
                  {tab.icon}
                  <span className="text-[10px] font-bold">{tab.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

/* ─── Root App ─── */
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Home: listagem de grupos */}
        <Route path="/" element={<Grupos />} />

        {/* Dentro de um grupo */}
        <Route path="/g/:grupoId" element={<GrupoLayout />}>
          <Route index element={<GrupoHome />} />
          <Route path="caixinha" element={<Caixinha />} />
          <Route path="elenco" element={<Grupo />} />
          <Route path="racha/:id" element={<RachaDetalhe />} />
          <Route path="jogador/:id" element={<Jogador />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
