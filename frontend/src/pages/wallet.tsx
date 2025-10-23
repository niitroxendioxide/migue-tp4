import React, { use, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useBalanceCharge } from '../hooks/BalanceHook';
import { useAuthStore } from '../authStore/authStore';
interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const isAuthenticated = true; // Replace with actual authentication logic
  const { chargeAmount, loading, error: errorCargandoBalance } = useBalanceCharge();
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

    const result = await chargeAmount(numAmount);
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
    <div onClick={() => onClose()} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-dark">Recargar Saldo</h2>
          <button
            onClick={() => onClose()}
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
                  onClick={() => chargeAmount(preset)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={loading}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {errorCargandoBalance && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorCargandoBalance}
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
              onClick={() => onClose()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !amount}
              onClick={() => chargeAmount(parseFloat(amount))}
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
  const user = useAuthStore.getState().user;
  const isAuthenticated = true; // Replace with actual authentication logic
  const loading = false; // Replace with actual loading state
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const balance = useAuthStore.getState().user?.balance ?? 0;
  if (!isAuthenticated) {
    window.location.hash = '/auth';
    return null;
  }

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
                ${loading ? '...' : balance}
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




      </div>

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => {setShowTopUpModal(false);}}
        onSuccess={() => {
          // La recarga fue exitosa, el contexto ya se actualizó
        }}
      />
    </Layout>
  );
};

export default WalletPage;