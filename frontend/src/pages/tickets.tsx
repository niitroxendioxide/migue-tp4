import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useEventUnjoin, useJoinedEvents } from '../hooks/EventsHook';
import { X } from 'lucide-react';
const CancelTicketModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-text-dark mb-2">Cancelar Entrada</h2>
          <p className="text-text-muted mb-6">
            ¿Estás seguro que quieres cancelar tu entrada?
          </p>
          <p className="text-sm text-red-600 mb-6">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50"
          >
            No, mantener entrada
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Sí, cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
const TicketsPage: React.FC = () => {
  const { joinedEvents, loading, error, fetchJoinedEvents } = useJoinedEvents();
  const {unjoinEvent,loading:loadingUnjoin,error:errorUnjoin} = useEventUnjoin();
  const [cancelTicketId, setCancelTicketId] = useState<number | null>(null);
  const handleUnJoinEvent = async () => {
    if (cancelTicketId === null) return;
    try {
      await unjoinEvent(cancelTicketId);
      setCancelTicketId(null);
      fetchJoinedEvents();
    } catch (error) {
      console.error('Error cancelling ticket:', error);
    }
  };
  React.useEffect(() => {
    fetchJoinedEvents();
  }, [fetchJoinedEvents]);

  const TicketSkeleton = () => (
    <div className="flex items-center gap-4 border border-border rounded-lg p-4 bg-white shadow-sm animate-pulse">
      {/* Image skeleton */}
      <div className="w-28 h-20 rounded-md bg-gray-200 flex-shrink-0"></div>

      <div className="flex-1">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            {/* Date and location skeleton */}
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="text-right">
            {/* Price label skeleton */}
            <div className="h-3 bg-gray-200 rounded w-12 mb-2 ml-auto"></div>
            {/* Price skeleton */}
            <div className="h-6 bg-gray-200 rounded w-16 ml-auto"></div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {/* Ticket code skeleton */}
          <div className="h-3 bg-gray-200 rounded w-32"></div>
          <div className="flex items-center gap-3">
            {/* QR skeleton */}
            <div className="w-12 h-12 rounded-md bg-gray-200"></div>
            {/* Link skeleton */}
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Mis Entradas</h1>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, idx) => (
              <TicketSkeleton key={idx} />
            ))}
          </div>
        ) : (!Array.isArray(joinedEvents) || joinedEvents.length === 0) ? (
          <div className="p-6 bg-surface border border-border rounded-lg text-center text-text-muted">
            No tienes entradas compradas.
          </div>
        ) : (
          <div className="grid gap-4">
            {joinedEvents.map((joined, idx) => {
              const e = (joined as any).event || joined;
              const dateObj = new Date(e.date);
              const dateStr = dateObj.toLocaleString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              const priceLabel = !e.price ? 'Gratis' : `$${(e.price ?? 0).toFixed(2)}`;

              return (
                <div key={e.id ?? idx} className="flex items-center gap-4 border border-border rounded-lg p-4 bg-white shadow-sm">
                  <div className="w-28 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <img src={e.image_url || '/placeholder-event.jpg'} alt={e.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-text-base">{e.title}</h3>
                        <p className="text-sm text-text-muted">{dateStr} • {e.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-muted">Precio</p>
                        <p className="text-lg font-bold">{priceLabel}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-text-muted">
                        Código: <span className="font-mono">TICKET-{('000000' + String(e.id)).slice(-6)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md bg-surface flex items-center justify-center text-xs text-text-muted">QR</div>
                        <a href={`/events/${e.id}`} className="text-sm text-primary hover:underline">Ver evento</a>
                        <button onClick={() => setCancelTicketId(e.id)} className="text-sm text-red-500 hover:text-red-300"><X /></button>
                      </div>
                      
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CancelTicketModal
        isOpen={!!cancelTicketId}
        onClose={() => setCancelTicketId(null)}
        onConfirm={handleUnJoinEvent}
      />


    </Layout>
  );
};



export default TicketsPage;