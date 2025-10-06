import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { EventCard } from '../components/EventCard';
import { SearchFilter } from '../components/SearchFilter';
import { Event } from '../types';

// Mock data for development
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2025',
    date: '2025-11-15T09:00:00Z',
    description: 'Annual technology conference featuring the latest innovations in software development.',
    description_extended: 'Join us for a full day of presentations, workshops, and networking opportunities with industry leaders. Learn about cutting-edge technologies, best practices, and future trends that will shape the tech industry.',
    location: 'San Francisco Convention Center',
    imagen_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 299.99,
    is_paid: true,
    is_cancelled: false
  },
  {
    id: '2',
    title: 'Community Art Exhibition',
    date: '2025-10-20T18:00:00Z',
    description: 'Local artists showcase their latest works in this community-driven art exhibition.',
    description_extended: 'Discover the vibrant local art scene with works from over 50 community artists. Enjoy wine, music, and the opportunity to purchase original pieces.',
    location: 'Downtown Art Gallery',
    imagen_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 0,
    is_paid: false,
    is_cancelled: false
  },
  {
    id: '3',
    title: 'Music Festival 2025',
    date: '2025-12-05T16:00:00Z',
    description: 'Three-day music festival featuring international and local artists.',
    description_extended: 'Experience three days of non-stop music across multiple stages. From rock to electronic, folk to hip-hop, there\'s something for every music lover.',
    location: 'Golden Gate Park',
    imagen_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 150.00,
    is_paid: true,
    is_cancelled: false
  },
  {
    id: '4',
    title: 'Startup Networking Night',
    date: '2025-10-30T19:00:00Z',
    description: 'Connect with entrepreneurs, investors, and innovators in the startup ecosystem.',
    description_extended: 'An evening dedicated to fostering connections in the startup community. Meet potential co-founders, investors, and collaborators while enjoying drinks and appetizers.',
    location: 'Innovation Hub',
    imagen_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 25.00,
    is_paid: true,
    is_cancelled: false
  },
  {
    id: '5',
    title: 'Coding Workshop',
    date: '2025-11-02T10:00:00Z',
    description: 'Learn modern web development techniques in this hands-on workshop.',
    description_extended: 'Perfect for beginners and intermediate developers. We\'ll cover React, TypeScript, and modern development tools. All materials and refreshments provided.',
    location: 'Tech Learning Center',
    imagen_url: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 0,
    is_paid: false,
    is_cancelled: false
  }
];

export const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(false);

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
        filtered = filtered.filter(event => event.is_paid);
        break;
      case 'free':
        filtered = filtered.filter(event => !event.is_paid);
        break;
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.date) > new Date());
        break;
      default:
        break;
    }

    return filtered;
  }, [events, searchTerm, selectedFilter]);

  const handleJoinEvent = (eventId: string) => {
    // TODO: Implement join event logic
    console.log('Joining event:', eventId);
    // This would typically make an API call to join the event
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{events.length}</div>
            <div className="text-gray-600">Total Events</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {events.filter(e => !e.is_paid).length}
            </div>
            <div className="text-gray-600">Free Events</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {events.filter(e => new Date(e.date) > new Date()).length}
            </div>
            <div className="text-gray-600">Upcoming Events</div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onJoinEvent={handleJoinEvent}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg 
              className="mx-auto h-24 w-24 text-gray-400 mb-4" 
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find events.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};