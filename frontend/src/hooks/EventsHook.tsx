import { useState, useCallback } from 'react';
import {  UnJoinEventResponse, Event, EventUser,CreateEventRequest, CreateEventResponse, JoinEventRequest, JoinEventResponse } from '../../../shared/types';
import { useAuthStore } from '../authStore/authStore';
interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  getAllEvents: () => Promise<Event[]>;
}

export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === 'string') {
      setError(err);
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const getAllEvents = useCallback(async (): Promise<Event[]> => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const eventsData = await response.json();
      setEvents(eventsData);
      console.log(eventsData);
      return eventsData;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);


  return {
    events,
    loading,
    error,
    getAllEvents,


  };
};

// Individual hooks for specific operations
export const useEventCreation = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCallback(async (eventData: CreateEventRequest): Promise<CreateEventResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || response.statusText;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  return {
    createEvent,
    loading,
    error,
  };
};

export const useEventJoin = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const joinEvent = useCallback(async (eventId: number): Promise<JoinEventResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/events/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || response.statusText;
        throw new Error(errorMessage);
      }
      const data = await response.json();
      useAuthStore.getState().updateBalance(data.newBalance);
      return data;
    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);

      throw err;

    } finally {
      setLoading(false);
    }
  }, []);



  return {
    joinEvent,
    loading,
    error,

  };
};

export const useJoinedEvents = () => {
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJoinedEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/events/joined', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || response.statusText;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Fetched joined events:', data);
      // Ensure we always store an array
      setJoinedEvents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    joinedEvents,
    loading,
    error,
    fetchJoinedEvents,
  };
};


export const useCreatedEvents = () => {
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCreatedEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/events/created', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || response.statusText;
        throw new Error(errorMessage);
      }
     
      const data = await response.json();
      console.log('Fetched created events:', data);
      setCreatedEvents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createdEvents,
    loading,
    error,
    fetchCreatedEvents,
  };
};

export const useEventCancellation = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cancelEvent = useCallback(async (eventId: number): Promise<UnJoinEventResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/events/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || response.statusText;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cancelEvent,
    loading,
    error,
  };
};

export const useEventUnjoin = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const unjoinEvent = useCallback(async (eventId: number): Promise<UnJoinEventResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/events/unjoin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || response.statusText;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    unjoinEvent,
    loading,
    error,
  };
};
