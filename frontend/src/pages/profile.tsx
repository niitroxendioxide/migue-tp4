import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../authStore/authStore';
interface CancelEventModalProps {
  isOpen: boolean;
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const CancelEventModal: React.FC<CancelEventModalProps> = ({ 
  isOpen, 
  eventTitle, 
  onConfirm, 
  onCancel, 
  loading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-text-dark mb-2">Cancelar Evento</h2>
          <p className="text-text-muted mb-6">
            ¿Estás seguro que quieres cancelar "<strong>{eventTitle}</strong>"?
          </p>
          <p className="text-sm text-red-600 mb-6">
            Esta acción no se puede deshacer. Los asistentes serán notificados.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50"
            disabled={loading}
          >
            No, mantener evento
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Placeholder for cancelEvent service (replace with real implementation)
const cancelEvent = async (eventId: string): Promise<boolean> => {
  console.log('cancelEvent called for', eventId);
  // TODO: call backend service
  return true;
};

const ProfilePage: React.FC = () => {
  const user = useAuthStore.getState().user;
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  const balance = useAuthStore.getState().user?.balance ?? 0;
  const createdEvents = [
    // Mock data for created events
    { id: '1', title: 'Concierto de Rock', date: '2024-09-15T20:00:00Z', location: 'Auditorio Nacional', is_paid: true, price: 50.00, attendees: 150, is_cancelled: false, description: 'Un increíble concierto de rock con bandas locales.', image_url: '' },
  ];
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; eventId: string; eventTitle: string }>({
    isOpen: false,
    eventId: '',
    eventTitle: ''
  });
  const [cancelLoading, setCancelLoading] = useState(false);

  if (!isAuthenticated) {
    window.location.hash = '/auth';
    return null;
  }



  const handleCancelEvent = async () => {
    setCancelLoading(true);
    try {
      const success = await cancelEvent(cancelModal.eventId);
      if (success) {
        setCancelModal({ isOpen: false, eventId: '', eventTitle: '' });
        // Optionally show success message
      }
    } catch (error) {
      console.error('Error cancelling event:', error);
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEventCard = (event: any, showCancelButton = false) => (
    <div
      key={event.id}
      className={`bg-white rounded-lg border ${event.is_cancelled ? 'border-red-200 bg-red-50' : 'border-gray-200'} p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-lg font-bold ${event.is_cancelled ? 'text-red-600' : 'text-text-dark'}`}>
              {event.title}
            </h3>
            {event.is_cancelled && (
              <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                CANCELADO
              </span>
            )}
          </div>
          <p className="text-text-muted text-sm mb-2">{formatDate(event.date)}</p>
          <p className="text-text-muted text-sm mb-2">📍 {event.location}</p>
          {event.description && (
            <p className="text-text-base text-sm mb-3">{event.description}</p>
          )}
        </div>
        {event.image_url && (
          <div className="w-20 h-20 rounded-lg overflow-hidden ml-4">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <span>👥 {event.attendees || 0} asistentes</span>
          {event.is_paid ? (
            <span>💰 ${event.price?.toFixed(2) || '0.00'}</span>
          ) : (
            <span>🎟️ Gratis</span>
          )}
        </div>
        
        {showCancelButton && !event.is_cancelled && (
          <button
            onClick={() => setCancelModal({
              isOpen: true,
              eventId: event.id,
              eventTitle: event.title
            })}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Cancelar Evento
          </button>
        )}
      </div>
    </div>
  );


  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header del perfil */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
              <p className="text-white/80 text-lg">{user?.email}</p>
              <p className="text-white/60 text-sm">
                Miembro desde {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Saldo actual</p>
              <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600">🎭</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Eventos Creados</p>
                <p className="font-bold text-lg">{createdEvents.length}</p>
              </div>
            </div>
          </div>

          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600">👥</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Total Asistentes</p>
                <p className="font-bold text-lg">
                  {createdEvents.reduce((sum, event) => sum + (event.attendees || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          
        </div>

        {/* Gestión de eventos creados */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-text-dark">Mis Eventos</h2>
              <a
                href="/create-event"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                + Crear Evento
              </a>
            </div>
          </div>


          
        </div>
      </div>

      {/* Modal de cancelación */}
      <CancelEventModal
        isOpen={cancelModal.isOpen}
        eventTitle={cancelModal.eventTitle}
        onConfirm={handleCancelEvent}
        onCancel={() => setCancelModal({ isOpen: false, eventId: '', eventTitle: '' })}
        loading={cancelLoading}
      />
    </Layout>
  );
};

export default ProfilePage;