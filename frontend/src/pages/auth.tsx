import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useRegister, useLogin } from '../hooks/AuthHook';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../authStore/authStore';
export type AuthMode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  const {attemptLogin, loading: loginLoading, error: loginError} = useLogin();
  const navigate = useNavigate();
  const {authState: authMode, setAuthState: setAuthMode} = useAuthStore();

  const {attemptRegister, loading: registerLoading, error: registerError} = useRegister();
  const isAuthenticated = false; // Replace with actual authentication logic
  
  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);
  
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
            navigate('/');
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
            navigate('/');
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
    
    // Actualizar URL
    setAuthMode(newMode);


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


        </div>
      </div>
    </Layout>
  );
};