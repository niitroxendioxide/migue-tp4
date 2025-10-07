import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

// Simple placeholder for active nav logic (could be improved with routing later)
const navItems = [
  { label: 'Events', href: '#', current: true },
  { label: 'My Tickets', href: '#', current: false },
  { label: 'Create', href: '#', current: false }
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
  <div className="min-h-screen bg-bg u-text-base flex flex-col">
      {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur  bg-primary border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Branding */}
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center u-text-inverse font-bold text-sm shadow-md">
                M
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight u-text-title flex items-center gap-1">
                Migue<span className="text--primary">Eventos</span>
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 hover:text-black ${item.current ? 'text-white underline' : 'text-gray-300'} group`}
                >
                  {item.label}
                  {item.current && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary rounded-full"></span>
                  )}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full u-text-inverse bg-secondary shadow hover:shadow-md hover:bg-secondary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[.98] transition-all">
                Sign In
              </button>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full u-text-inverse bg-primary shadow hover:shadow-md hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[.98] transition-all">
                Get Started
              </button>
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
            <p className="font-semibold u-text-title mb-2">MigueEventos</p>
            <p className="u-text-muted leading-relaxed">Descubre, crea y comparte experiencias. Conecta con comunidades y vive más.</p>
          </div>
          <div>
            <p className="font-semibold u-text-title mb-2">Recursos</p>
            <ul className="space-y-1 u-text-muted">
              <li><a className="u-link" href="#">Blog</a></li>
              <li><a className="u-link" href="#">Soporte</a></li>
              <li><a className="u-link" href="#">API</a></li>
            </ul>
          </div>
            <div>
            <p className="font-semibold u-text-title mb-2">Legal</p>
            <ul className="space-y-1 u-text-muted">
              <li><a className="u-link" href="#">Términos</a></li>
              <li><a className="u-link" href="#">Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200/60 py-4">
          <p className="text-center text-xs u-text-muted">© {new Date().getFullYear()} MigueEventos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};