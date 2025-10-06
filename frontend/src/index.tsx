import React from 'react';
import ReactDOM from 'react-dom/client';
import { HomePage } from './pages/home';
import './index.css';

const App: React.FC = () => {
  return <HomePage />;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


