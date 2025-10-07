import React from 'react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onJoinEvent?: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onJoinEvent }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number, isPaid: boolean) => {
    if (!isPaid) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={event.image_url || '/placeholder-event.jpg'} 
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        {event.is_cancelled && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            Cancelled
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
          {formatPrice(event.price, event.is_paid)}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{formatDate(event.date)}</p>
        <p className="text-gray-700 mb-3 line-clamp-2">{event.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </span>
        </div>
        
        {!event.is_cancelled && onJoinEvent && (
          <button 
            onClick={() => onJoinEvent(event.id)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Join Event
          </button>
        )}
      </div>
    </div>
  );
};