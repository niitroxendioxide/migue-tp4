import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addFunds, loading } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const predefinedAmounts = [10, 25, 50, 100, 200];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    if (numAmount > 1000) {
      setError('El monto máximo por recarga es $1000');
      return;
    }

    const result = await addFunds(numAmount);
    if (result) {
      setSuccess(`¡Recarga exitosa! Se agregaron $${numAmount.toFixed(2)} a tu billetera`);
      setAmount('');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } else {
      setError('Error al procesar la recarga. Intenta nuevamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-dark">Recargar Saldo</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-dark text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-text-dark font-medium mb-2">
              Monto a recargar
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="1"
              max="1000"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-lg"
              disabled={loading}
            />
          </div>

          <div>
            <p className="text-text-muted text-sm mb-2">Montos sugeridos:</p>
            <div className="grid grid-cols-5 gap-2">
              {predefinedAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={loading}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !amount}
            >
              {loading ? 'Procesando...' : 'Recargar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WalletPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { balance, transactions, loading, getTransactionHistory } = useWallet();
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  if (!isAuthenticated) {
    window.location.hash = '/auth';
    return null;
  }

  const transactionHistory = getTransactionHistory();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '⬆️';
      case 'purchase':
        return '⬇️';
      case 'refund':
        return '↩️';
      default:
        return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return 'text-green-600';
      case 'purchase':
        return 'text-red-600';
      default:
        return 'text-text-dark';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Encabezado de billetera */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">Mi Billetera</h1>
              <p className="text-white/80">Hola, {user?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Saldo disponible</p>
              <p className="text-3xl font-bold">
                ${loading ? '...' : balance.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => setShowTopUpModal(true)}
              className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              💰 Recargar Saldo
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600">⬆️</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Total Recargado</p>
                <p className="font-bold text-lg">
                  ${transactionHistory
                    .filter(t => t.type === 'deposit')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600">⬇️</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Total Gastado</p>
                <p className="font-bold text-lg">
                  ${Math.abs(transactionHistory
                    .filter(t => t.type === 'purchase')
                    .reduce((sum, t) => sum + t.amount, 0))
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600">📊</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Transacciones</p>
                <p className="font-bold text-lg">{transactionHistory.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de transacciones */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-text-dark">Historial de Transacciones</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-text-muted">
                Cargando transacciones...
              </div>
            ) : transactionHistory.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <p className="text-4xl mb-4">💳</p>
                <p>No tienes transacciones aún</p>
                <p className="text-sm">¡Recarga tu billetera para empezar!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactionHistory.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">
                        {getTransactionIcon(transaction.type)}
                      </span>
                      <div>
                        <p className="font-medium text-text-dark">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-text-muted">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-text-muted">
                        ID: {transaction.id.slice(-8)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={() => {
          // La recarga fue exitosa, el contexto ya se actualizó
        }}
      />
    </Layout>
  );
};

export default WalletPage;