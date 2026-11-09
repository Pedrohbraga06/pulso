import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import { destinationFromState } from '../../app/routeState';
import { ApiError } from '../../services/api';
import { Button, FormField, InlineNotice } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { AuthLayout } from '../../layouts/AuthLayout';

function errorText(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Não foi possível concluir a solicitação. Verifique sua conexão e tente novamente.';
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login({ email, password });
      navigate(destinationFromState(location.state), { replace: true });
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card__heading">
        <p className="eyebrow">BEM-VINDO DE VOLTA</p>
        <h2>Acesse sua conta</h2>
        <p>Entre para acompanhar o ritmo da sua operação.</p>
      </div>
      {error && <InlineNotice tone="danger">{error}</InlineNotice>}
      <form className="auth-form" onSubmit={submit}>
        <FormField
          autoComplete="email"
          id="login-email"
          label="E-mail"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@empresa.com"
          required
          type="email"
          value={email}
        />
        <FormField
          autoComplete="current-password"
          id="login-password"
          label="Senha"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Sua senha"
          required
          type="password"
          value={password}
        />
        <div className="auth-form__meta">
          <span className="auth-form__security"><Icon name="check" size={14} /> Conexão segura</span>
          <span className="auth-form__muted">Recuperação de senha indisponível</span>
        </div>
        <Button className="auth-submit" disabled={busy} type="submit">
          {busy ? 'Entrando…' : 'Entrar'}
          {!busy && <Icon name="arrow" size={17} />}
        </Button>
      </form>
      <p className="auth-switch">Ainda não tem uma conta? <Link to="/register">Criar conta</Link></p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({ name, email, password, companyName });
      navigate('/app/overview', { replace: true });
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card__heading">
        <p className="eyebrow">COMECE POR AQUI</p>
        <h2>Crie sua conta</h2>
        <p>Configure seu acesso e a primeira empresa.</p>
      </div>
      {error && <InlineNotice tone="danger">{error}</InlineNotice>}
      <form className="auth-form" onSubmit={submit}>
        <FormField autoComplete="name" id="register-name" label="Seu nome" maxLength={120} minLength={1} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" required value={name} />
        <FormField autoComplete="organization" id="register-company" label="Nome da empresa" maxLength={120} minLength={2} onChange={(event) => setCompanyName(event.target.value)} placeholder="Ex.: Restaurante Aurora" required value={companyName} />
        <FormField autoComplete="email" id="register-email" label="E-mail profissional" maxLength={254} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" required type="email" value={email} />
        <FormField autoComplete="new-password" id="register-password" label="Senha" hint="Mínimo de 12 caracteres." maxLength={128} minLength={12} onChange={(event) => setPassword(event.target.value)} placeholder="Crie uma senha segura" required type="password" value={password} />
        <Button className="auth-submit" disabled={busy} type="submit">
          {busy ? 'Criando conta…' : 'Criar conta'}
          {!busy && <Icon name="arrow" size={17} />}
        </Button>
      </form>
      <p className="auth-switch">Já tem uma conta? <Link to="/login">Entrar</Link></p>
    </AuthLayout>
  );
}
