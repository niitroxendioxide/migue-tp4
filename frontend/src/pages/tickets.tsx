import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../contexts/TicketsContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { Layout } from '../components/Layout';

const TicketsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { tickets, loading, getUpcomingEvents: getUpcomingTickets, getPastEvents: getPastTickets, markAsAttended } = useTickets();
  const { 
    attendances, 
    loading: attendanceLoading, 
    getUpcomingAttendances, 
    getPastAttendances 
  } = useAttendance();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  if (!isAuthenticated) {
    window.location.hash = '/auth';
    return null;
  }

  // Combinar tickets pagos y asistencias gratuitas
  const upcomingTickets = getUpcomingTickets();
  const pastTickets = getPastTickets();
  const upcomingAttendances = getUpcomingAttendances();
  const pastAttendances = getPastAttendances();

  // Combinar ambos tipos para mostrar
  const allUpcoming = [
    ...upcomingTickets.map(t => ({ ...t, type: 'paid' as const })),
    ...upcomingAttendances.map(a => ({ 
      ...a, 
      type: 'free' as const,
      price: 0,
      transactionId: a.id,
      purchaseDate: a.confirmedAt
    }))
  ].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const allPast = [
    ...pastTickets.map(t => ({ ...t, type: 'paid' as const })),
    ...pastAttendances.map(a => ({ 
      ...a, 
      type: 'free' as const,
      price: 0,
      transactionId: a.id,
      purchaseDate: a.confirmedAt,
      attended: true // Las asistencias gratuitas se consideran "asistidas" por defecto
    }))
  ].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPurchaseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const TicketCard: React.FC<{ ticket: any; isUpcoming: boolean }> = ({ ticket, isUpcoming }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Event Image */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 flex-shrink-0">
          {ticket.eventImage ? (
            <img
              src={ticket.eventImage}
              alt={ticket.eventTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-2xl">🎟️</span>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-text-dark mb-1">
                {ticket.eventTitle}
              </h3>
              <p className="text-text-muted text-sm mb-2">
                📍 {ticket.eventLocation}
              </p>
              <p className="text-text-muted text-sm mb-2">
                🕒 {formatDate(ticket.eventDate)}
              </p>
              <p className="text-text-muted text-xs">
                {ticket.type === 'paid' ? 'Comprado' : 'Confirmado'} el: {formatPurchaseDate(ticket.purchaseDate)}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-lg mb-2">
                {ticket.type === 'paid' ? (
                  <span className="text-primary">${ticket.price.toFixed(2)}</span>
                ) : (
                  <span className="text-green-600">🎟️ Gratis</span>
                )}
              </p>
              
              {isUpcoming ? (
                <div className="flex flex-col gap-1">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    ✅ Confirmado
                  </span>
                  <button
                    onClick={() => markAsAttended(ticket.id)}
                    className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Marcar Asistencia
                  </button>
                </div>
              ) : (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  ticket.attended 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {ticket.attended ? '✅ Asistido' : '⏰ Pasado'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-text-dark mb-2">Mis Tickets</h1>
          <p className="text-text-muted">
            Gestiona y revisa todos los eventos a los que te has unido
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-text-muted">Cargando tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎟️</div>
            <h2 className="text-xl font-bold text-text-dark mb-2">
              No tienes tickets aún
            </h2>
            <p className="text-text-muted mb-6">
              ¡Explora eventos y únete a experiencias increíbles!
            </p>
            <a
              href="#/"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Explorar Eventos
            </a>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            {allUpcoming.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-text-dark">
                  Próximos Eventos ({allUpcoming.length})
                </h2>
                <div className="space-y-3">
                  {allUpcoming.map((ticket: any) => (
                    <TicketCard 
                      key={ticket.id || ticket.transactionId} 
                      ticket={ticket} 
                      isUpcoming={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {allPast.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-text-dark">
                  Eventos Pasados ({allPast.length})
                </h2>
                <div className="space-y-3">
                  {allPast.map((ticket: any) => (
                    <TicketCard 
                      key={ticket.id || ticket.transactionId} 
                      ticket={ticket} 
                      isUpcoming={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-lg text-text-dark mb-4">Resumen</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{allUpcoming.length + allPast.length}</p>
                  <p className="text-sm text-text-muted">Total Eventos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{allUpcoming.length}</p>
                  <p className="text-sm text-text-muted">Próximos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {allPast.filter((t: any) => t.attended).length}
                  </p>
                  <p className="text-sm text-text-muted">Asistidos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    ${tickets.reduce((sum, ticket) => sum + ticket.price, 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-text-muted">Total Gastado</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TicketsPage;