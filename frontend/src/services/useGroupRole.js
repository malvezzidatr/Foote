import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getMeuRole } from './api';

export function useGroupRole(grupoId) {
  const { isLoggedIn, user } = useAuth();
  const [role, setRole] = useState(null);
  const [membroId, setMembroId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // user?.id garante que re-executa quando troca de conta
  const userId = user?.id;

  useEffect(() => {
    setRole(null);
    setMembroId(null);
    setLoaded(false);

    if (!isLoggedIn || !grupoId) {
      setLoaded(true);
      return;
    }

    getMeuRole(grupoId)
      .then(data => {
        setRole(data?.role || null);
        setMembroId(data?.membro_id || null);
      })
      .catch(() => {
        setRole(null);
        setMembroId(null);
      })
      .finally(() => setLoaded(true));
  }, [isLoggedIn, grupoId, userId]);

  return {
    role,
    membroId,
    loaded,
    isAdmin: loaded && role === 'admin',
    isMembro: loaded && (role === 'admin' || role === 'membro'),
  };
}
