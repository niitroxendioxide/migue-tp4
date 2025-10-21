import React from 'react';
import ReactDOM from 'react-dom/client';
import { HomePage } from './pages/home';
import { AuthPage } from './pages/auth';
import { CreateEventPage } from './pages/create-event';
import WalletPage from './pages/wallet';
import TicketsPage from './pages/tickets';
import ProfilePage from './pages/profile';
import './index.css';

const App: React.FC = () => {
  // Simple router basado en hash para evitar configuración del servidor
  const [currentPath, setCurrentPath] = React.useState(window.location.hash.slice(1) || '/');

  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simple routing
  const renderPage = () => {
    switch (true) {
      case currentPath === '/auth' || currentPath.startsWith('/auth/'):
        return <AuthPage />;
      case currentPath === '/create-event':
        return <CreateEventPage />;
      case currentPath === '/wallet':
        return <WalletPage />;
      case currentPath === '/tickets':
        return <TicketsPage />;
      case currentPath === '/profile':
        return <ProfilePage />;
      case currentPath === '/':
      default:
        return <HomePage />;
    }
  };

  return renderPage();
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


