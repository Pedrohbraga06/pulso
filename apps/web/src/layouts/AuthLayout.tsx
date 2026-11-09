import type { ReactNode } from 'react';
import { Brand } from '../components/ui';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-aside" aria-label="Sobre o PULSO">
        <Brand />
        <div className="auth-aside__content">
          <span className="auth-kicker"><span /> INTELIGÊNCIA OPERACIONAL</span>
          <h1>Seu negócio.<br /><span>No ritmo certo.</span></h1>
          <p>Clareza para decidir. Controle para crescer. O pulso da sua operação em um só lugar.</p>
        </div>
        <div className="auth-aside__orb auth-aside__orb--one" />
        <div className="auth-aside__orb auth-aside__orb--two" />
        <div className="auth-aside__footer">
          <span>© 2026 PULSO</span>
          <span>Operação em movimento</span>
        </div>
      </section>
      <section className="auth-main">
        <div className="auth-main__mobile-brand"><Brand /></div>
        <div className="auth-card">{children}</div>
        <p className="auth-main__footer">Ao continuar, você concorda com os termos de uso e a política de privacidade.</p>
      </section>
    </main>
  );
}
