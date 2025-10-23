import React, { use, useState } from 'react';
import { Layout } from '../components/Layout';
import { useEventCreation, useEvents } from '../hooks/EventsHook';
import { useAuthStore } from '../authStore/authStore';
import { useNavigate } from 'react-router-dom';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  price: string;
  is_paid: boolean;
}

export const CreateEventPage: React.FC = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  const user = useAuthStore.getState().user;
  const { createEvent, loading: eventsLoading } = useEventCreation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image_url: '',
    price: '',
    is_paid: false
  });

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combinar fecha y hora
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Crear evento usando el contexto
      const eventId = await createEvent({
        id_user: user!.id,
        title: formData.title,
        description: formData.description,
        date: eventDateTime.toISOString(),
        location: formData.location,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        price: formData.is_paid ? parseFloat(formData.price) : 0,
      });

      console.log('Evento creado con ID:', eventId);
      
      setSuccess(true);
      
      // Redirigir al perfil después de un momento
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (error) {
      console.error('Error creando evento:', error);
      alert('Error al crear el evento. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-base mb-4">Acceso Requerido</h2>
            <p className="text-text-muted">Debes iniciar sesión para crear un evento.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-text-base mb-4">
            Crear Nuevo Evento
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Comparte tu evento con la comunidad y conecta con personas que comparten tus intereses.
          </p>
        </div>

        {/* Mensaje de éxito */}
        {success && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">¡Evento creado exitosamente!</h2>
            <p className="text-green-600">
              Tu evento ha sido publicado. Redirigiendo a tu perfil...
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-surface border border-border rounded-lg shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-base mb-2">
                Título del Evento *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Ej. Conferencia de Tecnología 2025"
              />
            </div>

            {/* Descripción corta */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-base mb-2">
                Descripción Corta *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                placeholder="Breve descripción que aparecerá en la tarjeta del evento..."
              />
              <p className="mt-1 text-xs text-text-subtle">Máximo 160 caracteres recomendados</p>
            </div>



            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-text-base mb-2">
                  Fecha del Evento *
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-text-base mb-2">
                  Hora del Evento *
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  required
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text-base mb-2">
                Ubicación *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Ej. Centro de Convenciones, Dirección completa"
              />
            </div>

            {/* URL de imagen */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-text-base mb-2">
                URL de Imagen
              </label>
              <input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="mt-1 text-xs text-text-subtle">Si no proporcionas una imagen, se usará una por defecto</p>
            </div>

            {/* Precio */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="is_paid"
                  name="is_paid"
                  type="checkbox"
                  checked={formData.is_paid}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="is_paid" className="ml-2 block text-sm text-text-base">
                  Este es un evento de pago
                </label>
              </div>

              {formData.is_paid && (
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-text-base mb-2">
                    Precio de Entrada *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">$</span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      required={formData.is_paid}
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="button"
                onClick={() => window.location.hash = '/'}
                className="flex-1 sm:flex-none px-6 py-3 border border-border rounded-md shadow-sm text-sm font-medium text-text-base bg-surface hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-text-inverse border-t-transparent"></div>
                    Creando evento...
                  </div>
                ) : (
                  'Crear Evento'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-8 p-4 bg-secondary/10 border border-secondary/20 rounded-md">
          <h3 className="text-sm font-medium text-text-base mb-2">💡 Consejos para crear un gran evento</h3>
          <ul className="text-xs text-text-muted space-y-1">
            <li>• Usa un título claro y descriptivo</li>
            <li>• Incluye todos los detalles importantes en la descripción</li>
            <li>• Asegúrate de que la fecha y hora sean correctas</li>
            <li>• Proporciona una dirección completa y fácil de encontrar</li>
            <li>• Usa una imagen atractiva que represente tu evento</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};