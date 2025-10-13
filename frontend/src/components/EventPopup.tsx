import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useTickets } from '../contexts/TicketsContext';

interface Event {
  title: string;
  description?: string;
  description_extended?: string;
  date: string;
  location: string;
  image_url?: string;
  price?: number;
  is_paid: boolean;
  is_cancelled: boolean;
}

interface EventPopupProps extends Event {
  onConfirm: () => void;
  onCancel: () => void;
}

export const EventPopup: React.FC<EventPopupProps> = ({
  title,
  description,
  description_extended,
  date,
  location,
  image_url,
  price,
  is_paid,
  is_cancelled,
  onConfirm,
  onCancel,
}) => {
  const { isAuthenticated } = useAuth();
  const { balance, debitFunds, loading: walletLoading } = useWallet();
  const { addTicket } = useTickets();
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string>('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const canAfford = !is_paid || (price ? balance >= price : true);
  const needsPayment = Boolean(is_paid && price && price > 0);
  const handlePurchase = async () => {
    if (!isAuthenticated) {
      window.location.hash = '/auth';
      return;
    }

    if (is_cancelled) {
      setPurchaseError('Este evento ha sido cancelado');
      return;
    }

    if (!needsPayment) {
      // Evento gratuito
      addTicket({
        eventTitle: title,
        eventDate: date,
        eventLocation: location,
        price: 0,
        transactionId: `free_${Date.now()}`,
        eventImage: image_url
      });
      onConfirm();
      return;
    }

    if (!canAfford) {
      setPurchaseError('Saldo insuficiente. Recarga tu billetera para continuar.');
      return;
    }

    setPurchaseLoading(true);
    setPurchaseError('');

    try {
      const success = await debitFunds(
        price!,
        `Entrada para: ${title}`,
        `event_${Date.now()}` // ID temporal del evento
      );

      if (success) {
        // Agregar ticket a la colección del usuario
        addTicket({
          eventTitle: title,
          eventDate: date,
          eventLocation: location,
          price: price!,
          transactionId: `txn_${Date.now()}`,
          eventImage: image_url
        });
        
        setPurchaseSuccess(true);
        setTimeout(() => {
          onConfirm();
        }, 1500);
      } else {
        setPurchaseError('Error al procesar el pago. Intenta nuevamente.');
      }
    } catch (error) {
      setPurchaseError('Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Close on ESC and lock background scroll while modal is open
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onCancel]);

  const stopPropagation: React.MouseEventHandler<HTMLDivElement> = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(55, 37, 31, 0.60)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--color-radius)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'scale-in .25s cubic-bezier(.4,0,.2,1)'
        }}
        onClick={stopPropagation}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 pb-4"
          style={{
            background: 'rgba(241, 239, 207, 0.95)',
            backdropFilter: 'blur(2px)',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <h2 id="event-dialog-title" className="text-2xl font-semibold text-text-base">
            {title}
          </h2>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors"
            style={{ background: 'var(--color-surface)', color: 'var(--color-primary)' }}
            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-inverse)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)'; }}
          >
            <span className='w-5 h-5'>X</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {image_url && (
            <div className="w-full h-64 rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <img
                src={image_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {is_cancelled && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-md" style={{ background: 'rgba(221, 90, 99, 0.10)', border: '1px solid #b91c1c' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-danger)' }}>
                ⚠ This event has been cancelled
              </span>
            </div>
          )}

          {description && (
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-base)' }}>{description}</p>
          )}

          {description_extended && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{description_extended}</p>
          )}

          <div className="grid gap-3 pt-2">
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium min-w-20" style={{ color: 'var(--color-text-muted)' }}>Date:</span>
              <span className="text-sm" style={{ color: 'var(--color-text-base)' }}>
                {new Date(date).toLocaleString()}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-sm font-medium min-w-20 text-text-muted">Location:</span>
              <span className="text-sm text-text-base">{location}</span>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-sm font-medium min-w-20 text-text-muted">Price:</span>
              <span className={`text-sm font-semibold ${is_paid ? 'text-text-success' : 'text-text-danger'}`}>
                {is_paid ? `$${price?.toFixed(2)}` : 'Free'}
              </span>
            </div>
          </div>

          
        </div>

        {/* Footer */}
        <div className="flex flex-col justify-center items-center gap-3 p-6 pt-4 bg-surface-alt border-t-border">
          {purchaseSuccess ? (
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-lg font-medium text-green-600 mb-1">¡Compra exitosa!</p>
              <p className="text-sm text-text-muted">Te has unido al evento</p>
            </div>
          ) : (
            <>
              {purchaseError && (
                <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {purchaseError}
                  {purchaseError.includes('Saldo insuficiente') && (
                    <div className="mt-2">
                      <a 
                        href="#/wallet" 
                        className="text-red-600 underline hover:text-red-800"
                        onClick={onCancel}
                      >
                        Ir a billetera
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-center">
                {is_cancelled ? (
                  <p className="text-lg font-medium text-red-600">
                    Evento Cancelado
                  </p>
                ) : needsPayment ? (
                  <div>
                    <p className="text-base font-medium text-text-base mb-1">
                      Precio: ${price?.toFixed(2)}
                    </p>
                    {isAuthenticated && (
                      <p className="text-sm text-text-muted">
                        Tu saldo: ${balance.toFixed(2)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-base font-medium text-text-base">
                    ¿Te gustaría unirte a este evento gratuito?
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="h-11 px-8 rounded-md cursor-pointer border-black bg-danger hover:bg-danger-hover text-text-inverse text-sm font-medium border transition-colors"
                  disabled={purchaseLoading}
                >
                  Cancelar
                </button>
                
                {!is_cancelled && (
                  <button
                    onClick={handlePurchase}
                    disabled={purchaseLoading || walletLoading || (!canAfford && needsPayment)}
                    className="cursor-pointer h-11 px-8 rounded-md border-black bg-success hover:bg-success-hover text-text-inverse text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {purchaseLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                      </div>
                    ) : !isAuthenticated ? (
                      'Iniciar Sesión'
                    ) : needsPayment ? (
                      canAfford ? `Comprar por $${price?.toFixed(2)}` : 'Saldo Insuficiente'
                    ) : (
                      'Unirse Gratis'
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};