import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useRegister, useLogin } from '../hooks/AuthHook';
type AuthMode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  const {attemptLogin, loading: loginLoading, error: loginError} = useLogin();
  const {attemptRegister, loading: registerLoading, error: registerError} = useRegister();
  const isAuthenticated = false; // Replace with actual authentication logic
  
  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.hash = '/';
    }
  }, [isAuthenticated]);
  
  // Detectar el modo desde la URL hash
  const getInitialMode = (): AuthMode => {
    const hash = window.location.hash;
    if (hash.includes('register') || hash.includes('signup')) {
      return 'register';
    }
    return 'login';
  };

  const [authMode, setAuthMode] = useState<AuthMode>(getInitialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    full_name: '',
    DNI: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Escuchar cambios en la URL para actualizar el modo
  React.useEffect(() => {
    const handleHashChange = () => {
      const newMode = getInitialMode();
      if (newMode !== authMode) {
        setAuthMode(newMode);
        // Limpiar formulario cuando cambia el modo
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          username: '',
          full_name: '',
          DNI: ''
        });
        setError('');
        setSuccess('');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [authMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (authMode === 'login') {
        // Login
        const result = await attemptLogin({email: formData.email, password: formData.password});
        
        if (result.success) {
          setSuccess('¡Inicio de sesión exitoso!');
          setTimeout(() => {
            window.location.hash = '/';
          }, 1000);
        } else {
          setError(result.message || 'Error al iniciar sesión');
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }

        const result = await attemptRegister({
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          DNI: parseInt(formData.DNI),
          password: formData.password
        });

        if (result.success) {
          setSuccess('¡Registro exitoso! Redirigiendo...');
          setTimeout(() => {
            window.location.hash = '/';
          }, 1000);
        } else {
          setError('Error al registrarse');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    const newMode = authMode === 'login' ? 'register' : 'login';
    setAuthMode(newMode);
    
    // Actualizar URL
    window.location.hash = newMode === 'register' ? '/auth/register' : '/auth';
    
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      full_name: '',
      DNI: ''
    });
    setError('');
    setSuccess('');
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-text-base">
              {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              {authMode === 'login' 
                ? 'Accede a tu cuenta para descubrir eventos increíbles'
                : 'Únete a nuestra comunidad de eventos'
              }
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-surface border border-border rounded-lg shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Registro: Campos adicionales */}
              {authMode === 'register' && (
                <>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-text-base mb-2">
                      Nombre de Usuario
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Tu nombre de usuario"
                    />
                  </div>
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-text-base mb-2">
                      Nombre Completo
                    </label>
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="DNI" className="block text-sm font-medium text-text-base mb-2">
                      DNI
                    </label>
                    <input
                      id="DNI"
                      name="DNI"
                      type="number"
                      required
                      value={formData.DNI}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Tu DNI"
                    />
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-base mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-base mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirmar Contraseña (solo registro) */}
              {authMode === 'register' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-base mb-2">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-surface-alt text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {/* Forgot Password (solo login) */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-text-muted">
                      Recordarme
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="/" className="text-text-link hover:text-text-link hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                </div>
              )}

              {/* Mensajes de error y éxito */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-text-inverse border-t-transparent"></div>
                      Procesando...
                    </div>
                  ) : (
                    authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
                  )}
                </button>
              </div>

              {/* Toggle Auth Mode */}
              <div className="text-center">
                <p className="text-sm text-text-muted">
                  {authMode === 'login' 
                    ? '¿No tienes una cuenta? ' 
                    : '¿Ya tienes una cuenta? '
                  }
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-text-link hover:text-text-link hover:underline font-medium"
                  >
                    {authMode === 'login' ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-bg text-text-muted">O continúa con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-surface text-sm font-medium text-text-base hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-surface text-sm font-medium text-text-base hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};