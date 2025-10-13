import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface EventAttendance {
  id: string;
  eventId: string;
  userId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  confirmedAt: string;
  eventImage?: string;
}

interface AttendanceContextType {
  attendances: EventAttendance[];
  loading: boolean;
  confirmAttendance: (eventData: Omit<EventAttendance, 'id' | 'userId' | 'confirmedAt'>) => Promise<boolean>;
  cancelAttendance: (eventId: string) => Promise<boolean>;
  isAttending: (eventId: string) => boolean;
  getUpcomingAttendances: () => EventAttendance[];
  getPastAttendances: () => EventAttendance[];
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

interface AttendanceProviderProps {
  children: React.ReactNode;
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [attendances, setAttendances] = useState<EventAttendance[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar asistencias cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAttendances();
    } else {
      setAttendances([]);
    }
  }, [isAuthenticated, user]);

  const loadAttendances = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const savedAttendances = localStorage.getItem(`attendances_${user?.id}`);
      setAttendances(savedAttendances ? JSON.parse(savedAttendances) : []);
    } catch (error) {
      console.error('Error loading attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAttendances = (newAttendances: EventAttendance[]) => {
    if (user?.id) {
      localStorage.setItem(`attendances_${user.id}`, JSON.stringify(newAttendances));
    }
  };

  const confirmAttendance = async (eventData: Omit<EventAttendance, 'id' | 'userId' | 'confirmedAt'>): Promise<boolean> => {
    if (!user?.id) return false;
    
    setLoading(true);
    try {
      // Simular confirmación
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newAttendance: EventAttendance = {
        ...eventData,
        id: `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        confirmedAt: new Date().toISOString()
      };

      const updatedAttendances = [newAttendance, ...attendances];
      setAttendances(updatedAttendances);
      saveAttendances(updatedAttendances);

      return true;
    } catch (error) {
      console.error('Error confirming attendance:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelAttendance = async (eventId: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simular cancelación
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const updatedAttendances = attendances.filter(attendance => attendance.eventId !== eventId);
      setAttendances(updatedAttendances);
      saveAttendances(updatedAttendances);

      return true;
    } catch (error) {
      console.error('Error cancelling attendance:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isAttending = (eventId: string): boolean => {
    return attendances.some(attendance => attendance.eventId === eventId);
  };

  const getUpcomingAttendances = (): EventAttendance[] => {
    const now = new Date();
    return attendances.filter(attendance => new Date(attendance.eventDate) > now);
  };

  const getPastAttendances = (): EventAttendance[] => {
    const now = new Date();
    return attendances.filter(attendance => new Date(attendance.eventDate) <= now);
  };

  const value: AttendanceContextType = {
    attendances,
    loading,
    confirmAttendance,
    cancelAttendance,
    isAttending,
    getUpcomingAttendances,
    getPastAttendances
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};