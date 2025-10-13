import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface PurchasedEvent {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  price: number;
  purchaseDate: string;
  transactionId: string;
  eventImage?: string;
  attended?: boolean;
}

interface TicketsContextType {
  tickets: PurchasedEvent[];
  loading: boolean;
  addTicket: (event: Omit<PurchasedEvent, 'id' | 'purchaseDate'>) => void;
  markAsAttended: (ticketId: string) => void;
  getUpcomingEvents: () => PurchasedEvent[];
  getPastEvents: () => PurchasedEvent[];
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketsContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
};

interface TicketsProviderProps {
  children: React.ReactNode;
}

export const TicketsProvider: React.FC<TicketsProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<PurchasedEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar tickets cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTickets();
    } else {
      setTickets([]);
    }
  }, [isAuthenticated, user]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const savedTickets = localStorage.getItem(`tickets_${user?.id}`);
      setTickets(savedTickets ? JSON.parse(savedTickets) : []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTickets = (newTickets: PurchasedEvent[]) => {
    if (user?.id) {
      localStorage.setItem(`tickets_${user.id}`, JSON.stringify(newTickets));
    }
  };

  const addTicket = (eventData: Omit<PurchasedEvent, 'id' | 'purchaseDate'>) => {
    const newTicket: PurchasedEvent = {
      ...eventData,
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      purchaseDate: new Date().toISOString()
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    saveTickets(updatedTickets);
  };

  const markAsAttended = (ticketId: string) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, attended: true } : ticket
    );
    setTickets(updatedTickets);
    saveTickets(updatedTickets);
  };

  const getUpcomingEvents = (): PurchasedEvent[] => {
    const now = new Date();
    return tickets.filter(ticket => new Date(ticket.eventDate) > now);
  };

  const getPastEvents = (): PurchasedEvent[] => {
    const now = new Date();
    return tickets.filter(ticket => new Date(ticket.eventDate) <= now);
  };

  const value: TicketsContextType = {
    tickets,
    loading,
    addTicket,
    markAsAttended,
    getUpcomingEvents,
    getPastEvents
  };

  return (
    <TicketsContext.Provider value={value}>
      {children}
    </TicketsContext.Provider>
  );
};