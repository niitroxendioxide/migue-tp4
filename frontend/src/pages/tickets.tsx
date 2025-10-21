import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useJoinedEvents } from '../hooks/EventsHook';

const TicketsPage: React.FC = () => {
  const { joinedEvents, loading, error, fetchJoinedEvents } = useJoinedEvents();

  React.useEffect(() => {
    fetchJoinedEvents();
  }, [fetchJoinedEvents]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Layout>
      <h1>Mis Entradas</h1>
      <ul>
        {!loading && (!Array.isArray(joinedEvents) || joinedEvents.length === 0) ? (
          <li>No tienes entradas compradas.</li>
        ) : (
          Array.isArray(joinedEvents) ? joinedEvents.map(event => (
            <li key={event.id}>{event.title}</li>
          )) : null
        )}

      </ul>
    </Layout>
  );
};

export default TicketsPage;