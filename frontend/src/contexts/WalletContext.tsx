import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Transaction {
  id: string;
  type: 'deposit' | 'purchase' | 'refund';
  amount: number;
  description: string;
  date: string;
  eventId?: string;
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  loading: boolean;
  addFunds: (amount: number) => Promise<boolean>;
  debitFunds: (amount: number, description: string, eventId?: string) => Promise<boolean>;
  getTransactionHistory: () => Transaction[];
  refreshBalance: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos de la billetera cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWalletData();
    } else {
      // Limpiar datos cuando no hay usuario
      setBalance(0);
      setTransactions([]);
    }
  }, [isAuthenticated, user]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos del backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const savedBalance = localStorage.getItem(`wallet_balance_${user?.id}`);
      const savedTransactions = localStorage.getItem(`wallet_transactions_${user?.id}`);
      
      setBalance(savedBalance ? parseFloat(savedBalance) : 0);
      setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWalletData = (newBalance: number, newTransactions: Transaction[]) => {
    if (user?.id) {
      localStorage.setItem(`wallet_balance_${user.id}`, newBalance.toString());
      localStorage.setItem(`wallet_transactions_${user.id}`, JSON.stringify(newTransactions));
    }
  };

  const addFunds = async (amount: number): Promise<boolean> => {
    if (!user || amount <= 0) return false;
    
    setLoading(true);
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction: Transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'deposit',
        amount: amount,
        description: `Recarga de saldo - $${amount.toFixed(2)}`,
        date: new Date().toISOString()
      };

      const newBalance = balance + amount;
      const newTransactions = [newTransaction, ...transactions];

      setBalance(newBalance);
      setTransactions(newTransactions);
      saveWalletData(newBalance, newTransactions);

      return true;
    } catch (error) {
      console.error('Error adding funds:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const debitFunds = async (amount: number, description: string, eventId?: string): Promise<boolean> => {
    if (!user || amount <= 0 || balance < amount) return false;
    
    setLoading(true);
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTransaction: Transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'purchase',
        amount: -amount,
        description: description,
        date: new Date().toISOString(),
        eventId: eventId
      };

      const newBalance = balance - amount;
      const newTransactions = [newTransaction, ...transactions];

      setBalance(newBalance);
      setTransactions(newTransactions);
      saveWalletData(newBalance, newTransactions);

      return true;
    } catch (error) {
      console.error('Error debiting funds:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTransactionHistory = (): Transaction[] => {
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const refreshBalance = () => {
    if (isAuthenticated && user) {
      loadWalletData();
    }
  };

  const value: WalletContextType = {
    balance,
    transactions,
    loading,
    addFunds,
    debitFunds,
    getTransactionHistory,
    refreshBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};