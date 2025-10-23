import React from 'react';
import { useAuthStore } from '../authStore/authStore';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
}

// Simple placeholder for active nav logic (could be improved with routing later)
const getNavItems = (isAuthenticated: boolean): NavItem[] => [
  { label: 'Eventos', path: '/' },
  ...(isAuthenticated ? [
    { label: 'Crear Evento', path: '/create-event' },
    { label: 'Mi Billetera', path: '/wallet' },
    { label: 'Mi Perfil', path: '/profile' },
    { label: 'Mis Tickets', path: '/tickets' }
  ] : []),
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const user = useAuthStore.getState().user;
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  const balance =  useAuthStore.getState().user?.balance ?? 0;
  const loading = false; // Replace with actual loading state
  const { setAuthState } = useAuthStore();
  const handleLogout = () => {
  useAuthStore.getState().logout();
  navigate('/');
};
  const navigate = useNavigate();
  
  const navItems = getNavItems(isAuthenticated);

  // Mostrar un loading spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <span className="text-text-muted">Verificando autenticación...</span>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-bg text-text-base flex flex-col">
      {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur  bg-primary border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Branding */}
            <div className="flex items-center gap-2">
            
              <a href="/" className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-base flex items-center gap-1 hover:opacity-80 transition-opacity">
                <span className='text-text-secondary'>Migue</span><span className="text-text-inverse">Eventos</span>
              </a>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item: NavItem) => {
              const isCurrent = location.pathname === item.path;
              
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 hover:text-white ${
                    isCurrent ? 'text-white' : 'cursor-pointer text-gray-300'
                  } group`}
                >
                  {item.label}
                  {isCurrent && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-secondary rounded-full"></span>
                  )}
                </button>
              );
            })}
          </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                // Usuario autenticado
                <div className="flex items-center gap-3">
                  <a 
                    href="/wallet"
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition-colors"
                  >
                    <span>💰</span>
                    <span className="font-medium">${balance.toFixed(2)}</span>
                  </a>
                  <span className="text-sm text-text-inverse hidden sm:block">
                    Hola, {user?.name || user?.full_name || user?.email.split('@')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full text-text-base bg-bg shadow hover:shadow-md hover:bg-secondary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[.98] transition-all"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                // Usuario no autenticado
                <>
                  <a 
                  onClick={() => setAuthState('login')}
                    href="/auth"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full text-text-base bg-bg shadow hover:shadow-md hover:bg-secondary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[.98] transition-all"
                  >
                    Iniciar Sesión
                  </a>
                  <a 
                    onClick={() => setAuthState('register')}
                    href="/auth" 
                    className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full text-text-inverse bg-primary shadow hover:shadow-md hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[.98] transition-all"
                  
                  >
                    Registrarse
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-4 pb-12">{children}</main>

      {/* Footer */}
    <footer className="mt-auto border-t border-border bg-surface/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-8 md:grid-cols-3 text-sm">
          <div>
            <p className="font-semibold text-text-base mb-2">MigueEventos</p>
            <p className="text-text-muted leading-relaxed">Descubre, crea y comparte experiencias. Conecta con comunidades y vive más.</p>
          </div>
          <div>
            <p className="font-semibold text-text-base mb-2">Recursos</p>
            <ul className="space-y-1 text-text-muted">
              <li><a className="text-text-link hover:text-text-link hover:underline" href="#">Blog</a></li>
              <li><a className="text-text-link hover:text-text-link hover:underline" href="#">Soporte</a></li>
              <li><a className="text-text-link hover:text-text-link hover:underline" href="#">API</a></li>
            </ul>
          </div>
            <div>
            <p className="font-semibold text-text-base mb-2">Legal</p>
            <ul className="space-y-1 text-text-muted">
              <li><a className="text-text-link hover:text-text-link hover:underline" href="#">Términos</a></li>
              <li><a className="text-text-link hover:text-text-link hover:underline" href="#">Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200/60 py-4">
          <p className="text-center text-xs text-text-muted">© {new Date().getFullYear()} MigueEventos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};