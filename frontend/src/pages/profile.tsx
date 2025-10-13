import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventsContext';
import { useWallet } from '../contexts/WalletContext';
import { useTickets } from '../contexts/TicketsContext';
import { Layout } from '../components/Layout';

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

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { balance } = useWallet();
  const { tickets } = useTickets();
  const { 
    createdEvents, 
    loading: eventsLoading, 
    cancelEvent,
    getUpcomingEvents,
    getPastEvents,
    getCancelledEvents
  } = useEvents();

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

  const upcomingEvents = getUpcomingEvents();
  const pastEvents = getPastEvents();
  const cancelledEvents = getCancelledEvents();

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

  const getActiveEvents = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingEvents;
      case 'past':
        return pastEvents;
      case 'cancelled':
        return cancelledEvents;
      default:
        return upcomingEvents;
    }
  };

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
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600">🎟️</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Tickets Comprados</p>
                <p className="font-bold text-lg">{tickets.length}</p>
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

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600">⭐</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Eventos Activos</p>
                <p className="font-bold text-lg">{upcomingEvents.length}</p>
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
                href="#/create-event"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                + Crear Evento
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-6">
            <div className="flex border-b border-gray-200">
              {[
                { key: 'upcoming', label: 'Próximos', count: upcomingEvents.length },
                { key: 'past', label: 'Pasados', count: pastEvents.length },
                { key: 'cancelled', label: 'Cancelados', count: cancelledEvents.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-text-dark'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Lista de eventos */}
          <div className="p-6">
            {eventsLoading ? (
              <div className="text-center py-8 text-text-muted">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                Cargando eventos...
              </div>
            ) : getActiveEvents().length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <p className="text-4xl mb-4">
                  {activeTab === 'upcoming' ? '📅' : activeTab === 'past' ? '📚' : '❌'}
                </p>
                <p>
                  {activeTab === 'upcoming' && 'No tienes eventos próximos'}
                  {activeTab === 'past' && 'No tienes eventos pasados'}
                  {activeTab === 'cancelled' && 'No tienes eventos cancelados'}
                </p>
                {activeTab === 'upcoming' && (
                  <a
                    href="#/create-event"
                    className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Crear tu primer evento
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {getActiveEvents().map(event => renderEventCard(event, activeTab === 'upcoming'))}
              </div>
            )}
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