import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface CreatedEvent {
  id: string;
  title: string;
  description?: string;
  description_extended?: string;
  date: string;
  location: string;
  image_url?: string;
  price?: number;
  is_paid: boolean;
  is_cancelled: boolean;
  created_at: string;
  creator_id: string;
  attendees: number;
  max_capacity?: number;
}

interface EventsContextType {
  createdEvents: CreatedEvent[];
  loading: boolean;
  createEvent: (eventData: Omit<CreatedEvent, 'id' | 'created_at' | 'creator_id' | 'attendees' | 'is_cancelled'>) => Promise<string>;
  cancelEvent: (eventId: string) => Promise<boolean>;
  updateEvent: (eventId: string, updates: Partial<CreatedEvent>) => Promise<boolean>;
  getEventById: (eventId: string) => CreatedEvent | undefined;
  getUpcomingEvents: () => CreatedEvent[];
  getPastEvents: () => CreatedEvent[];
  getCancelledEvents: () => CreatedEvent[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

interface EventsProviderProps {
  children: React.ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [createdEvents, setCreatedEvents] = useState<CreatedEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar eventos cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated && user) {
      loadEvents();
    } else {
      setCreatedEvents([]);
    }
  }, [isAuthenticated, user]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const savedEvents = localStorage.getItem(`created_events_${user?.id}`);
      setCreatedEvents(savedEvents ? JSON.parse(savedEvents) : []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvents = (events: CreatedEvent[]) => {
    if (user?.id) {
      localStorage.setItem(`created_events_${user.id}`, JSON.stringify(events));
    }
  };

  const createEvent = async (eventData: Omit<CreatedEvent, 'id' | 'created_at' | 'creator_id' | 'attendees' | 'is_cancelled'>): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Simular creación en backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEvent: CreatedEvent = {
        ...eventData,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        creator_id: user.id,
        attendees: 0,
        is_cancelled: false
      };

      const updatedEvents = [newEvent, ...createdEvents];
      setCreatedEvents(updatedEvents);
      saveEvents(updatedEvents);

      return newEvent.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelEvent = async (eventId: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simular cancelación en backend
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedEvents = createdEvents.map(event =>
        event.id === eventId ? { ...event, is_cancelled: true } : event
      );
      
      setCreatedEvents(updatedEvents);
      saveEvents(updatedEvents);
      
      return true;
    } catch (error) {
      console.error('Error cancelling event:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CreatedEvent>): Promise<boolean> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const updatedEvents = createdEvents.map(event =>
        event.id === eventId ? { ...event, ...updates } : event
      );
      
      setCreatedEvents(updatedEvents);
      saveEvents(updatedEvents);
      
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getEventById = (eventId: string): CreatedEvent | undefined => {
    return createdEvents.find(event => event.id === eventId);
  };

  const getUpcomingEvents = (): CreatedEvent[] => {
    const now = new Date();
    return createdEvents.filter(event => 
      new Date(event.date) > now && !event.is_cancelled
    );
  };

  const getPastEvents = (): CreatedEvent[] => {
    const now = new Date();
    return createdEvents.filter(event => 
      new Date(event.date) <= now && !event.is_cancelled
    );
  };

  const getCancelledEvents = (): CreatedEvent[] => {
    return createdEvents.filter(event => event.is_cancelled);
  };

  const value: EventsContextType = {
    createdEvents,
    loading,
    createEvent,
    cancelEvent,
    updateEvent,
    getEventById,
    getUpcomingEvents,
    getPastEvents,
    getCancelledEvents
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};