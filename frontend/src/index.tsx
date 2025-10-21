import React from 'react';
import ReactDOM from 'react-dom/client';
import { HomePage } from './pages/home';
import { AuthPage } from './pages/auth';
import { CreateEventPage } from './pages/create-event';
import WalletPage from './pages/wallet';
import TicketsPage from './pages/tickets';
import ProfilePage from './pages/profile';
import './index.css';
import {Routes, Route, BrowserRouter} from 'react-router-dom';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
};


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)



