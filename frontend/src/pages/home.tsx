import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { EventCard } from '../components/EventCard';
import { SearchFilter } from '../components/SearchFilter';
import { Event } from '../types';
import { EventPopup } from '../components/EventPopup';
import { useEvents } from '../hooks/EventsHook';


export const HomePage: React.FC = () => {
  const isAuthenticated = true; // Replace with actual authentication logic
  const {events,loading,error, getAllEvents} = useEvents();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [popupEvent, setPopupEvent] = useState<Event | null>(null);

  useEffect(() => {
    // getAllEvents está memoizado con useCallback en el hook, así que es seguro incluirlo en deps
    getAllEvents().catch((err) => {
      console.error('Error fetching events', err);
    });
    console.log(events);
  }, [getAllEvents]);
  // Filter and search logic
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'paid':
        filtered = filtered.filter(event => event.price);
        break;
      case 'free':
        filtered = filtered.filter(event => !event.attendees);
        break;
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.date) > new Date());
        break;
      default:
        break;
    }

    return filtered;
  }, [events, searchTerm, selectedFilter]);

  const handleSelectEvent = (event: Event) => {
    setPopupEvent(event);
    console.log('Selected event:', event);
  };

  const handleJoinEvent = (eventId: number) => {
    console.log('Joining event with ID:', eventId);
    setPopupEvent(null);
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Popup */}
        {popupEvent && (
          <EventPopup
            {...popupEvent}
            id={popupEvent.id}
            date={typeof popupEvent.date === 'string' ? popupEvent.date : popupEvent.date.toISOString()}
            onConfirm={() => handleJoinEvent(Number(popupEvent.id))}
            onCancel={() => setPopupEvent(null)}
          />
        )}
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-base mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Find and join exciting events in your area. From tech conferences to art exhibitions, 
            there's something for everyone.
          </p>
        </div>

        {/* Search and Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          selectedFilter={selectedFilter}
        />

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow-sm text-center border-border bg-surface">
            <div className="text-3xl font-extrabold text-primary mb-2">{events.length}</div>
            <div className="text-text-soft font-medium">Total Events</div>
          </div>
          <div className="p-6 rounded-lg shadow-sm text-center border-border bg-surface">
            <div className="text-3xl font-extrabold text-success mb-2">
              {events.filter(e => !e.attendees).length}
            </div>
            <div className="text-text-soft font-medium">Free Events</div>
          </div>
          <div className="p-6 rounded-lg shadow-sm text-center border-border bg-surface">
            <div className="text-3xl font-extrabold text-primary mb-2">
              {events.filter(e => new Date(e.date) > new Date()).length}
            </div>
            <div className="text-text-soft font-medium">Upcoming Events</div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-primary"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onJoinEvent={handleSelectEvent}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg 
              className="mx-auto h-24 w-24 text-text-subtle mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.44-1.007-5.914-2.614M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
              />
            </svg>
            <h3 className="text-xl font-medium text-text-base mb-2">No events found</h3>
            <p className="text-text-muted">
              Try adjusting your search terms or filters to find events.
            </p>
          </div>
        )}
      </div>

      {/* Botón flotante para crear evento (solo si está autenticado) */}
      {isAuthenticated && (
        <a
          href="/create-event"
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary-hover text-text-inverse p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
          title="Crear nuevo evento"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </a>
      )}
    </Layout>
  );
};