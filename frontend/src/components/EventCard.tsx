import React from 'react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onJoinEvent?: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onJoinEvent }) => {
  const dateObj = new Date(event.date);

  const fullDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const shortDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const shortTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const priceLabel = !event.is_paid ? 'Free' : `$${event.price.toFixed(0)}`;
  const isFree = !event.is_paid;

  return (
    <div
      className={`group relative rounded-xl border border-border bg-surface shadow-sm hover:shadow-md hover:border-border transition-all duration-300 overflow-hidden flex flex-col ${event.is_cancelled ? 'opacity-70 grayscale' : ''}`}
    >
      {/* Media */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.imagen_url || '/placeholder-event.jpg'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          loading="lazy"
        />
  <div className="absolute inset-0 bg-black/30 mix-blend-multiply pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-surface-alt shadow-sm u-text-soft border border-border">
            {shortDate} • {shortTime}
          </span>
          <span
            className={`px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide shadow-sm border backdrop-blur
              ${isFree ? 'bg-success u-text-inverse border-success-hover/70' : 'bg-primary u-text-inverse border-primary-hover/70'}`}
          >
            {priceLabel}
          </span>
        </div>

        {event.is_cancelled && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-[11px] font-semibold bg-red-600 u-text-inverse shadow border border-red-500/70">
            Cancelled
          </div>
        )}

        {/* Title overlay (optional) */}
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="u-text-inverse text-lg font-semibold drop-shadow-sm line-clamp-1 pr-8">
            {event.title}
          </h3>
        </div>
      </div>

      {/* Body */}
  <div className="p-5 flex flex-col flex-1 bg-surface">
  <p className="text-xs u-text-muted mb-1">{fullDate}</p>
        <p className="u-text-muted text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">{event.description}</p>

        <div className="flex items-start gap-2 text-xs u-text-muted mb-4">
          <svg className="w-4 h-4 mt-[2px] u-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1" title={event.location}>{event.location}</span>
        </div>

        {!event.is_cancelled && onJoinEvent && (
          <button
            onClick={() => onJoinEvent(event.id)}
            className={`w-full mt-auto inline-flex justify-center items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold tracking-wide shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-all
              ${isFree ? 'bg-success hover:bg-success-hover u-text-inverse focus-visible:ring-success' : 'bg-primary hover:bg-primary-hover u-text-inverse focus-visible:ring-primary'}`}
          >
            {isFree ? "0$" : priceLabel}
          </button>
        )}
        {event.is_cancelled && (
          <div className="mt-auto text-xs font-medium u-text-danger">This event was cancelled</div>
        )}
      </div>
    </div>
  );
};