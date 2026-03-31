import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../services/AuthContext';

export default function LoginButton({ onSuccess }) {
  const { loginGoogle } = useAuth();

  return (
    <GoogleLogin
      onSuccess={async (response) => {
        try {
          await loginGoogle(response.credential);
          onSuccess?.();
        } catch (err) {
          console.error('Erro no login:', err);
        }
      }}
      onError={() => console.error('Login falhou')}
      shape="pill"
      size="large"
      text="continue_with"
      locale="pt-BR"
    />
  );
}
