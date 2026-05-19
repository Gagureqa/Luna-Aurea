
// components/CancelOrderModal.js
import React, { useEffect, useState } from 'react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

const CancelOrderModal = () => {
  const { modal, hideModal } = useModal();
  const { cancelOrder } = useAuth();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showConfirmationError, setShowConfirmationError] = useState(false);

  // Закрытие по ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        hideModal();
      }
    };

    if (modal.isOpen && modal.type === 'cancel-order') {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modal.isOpen, modal.type, hideModal]);

  // Сброс состояния при закрытии/открытии модального окна
  useEffect(() => {
    if (modal.isOpen && modal.type === 'cancel-order') {
      setIsConfirmed(false);
      setShowConfirmationError(false);
    }
  }, [modal.isOpen, modal.type]);

  if (!modal.isOpen || modal.type !== 'cancel-order' || !modal.order) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      hideModal();
    }
  };

  const handleCancelOrder = async () => {
    // Проверяем, подтвердил ли пользователь отмену
    if (!isConfirmed) {
      setShowConfirmationError(true);
      
      // Плавно прокручиваем к чекбоксу подтверждения
      const checkbox = document.getElementById('confirm-cancel');
      if (checkbox) {
        checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Добавляем вибрацию для чекбокса
        checkbox.classList.add('animate-pulse', 'ring-2', 'ring-red-500');
        setTimeout(() => {
          checkbox.classList.remove('animate-pulse', 'ring-2', 'ring-red-500');
        }, 1000);
      }
      
      return;
    }

    try {
      await cancelOrder(modal.order.id);
      hideModal();
      
      // Показываем уведомление об успешной отмене
      setTimeout(() => {
        if (modal.onSuccess) {
          modal.onSuccess('Заказ успешно отменен!');
        }
      }, 100);
    } catch (error) {
      console.error('Error canceling order:', error);
      if (modal.onError) {
        modal.onError('Не удалось отменить заказ');
      }
    }
  };

  const getOrderStatusBadge = (status) => {
    const statuses = {
      pending: { text: 'В обработке', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      completed: { text: 'Завершен', color: 'text-green-600', bg: 'bg-green-100' },
      cancelled: { text: 'Отменен', color: 'text-red-600', bg: 'bg-red-100' },
      shipped: { text: 'Отправлен', color: 'text-blue-600', bg: 'bg-blue-100' }
    };
    return statuses[status] || statuses.pending;
  };

  const status = getOrderStatusBadge(modal.order.status);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 scale-95 hover:scale-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-xl"><img src="/images/predup.png" alt="предупреждение" className="w-5 h-5 inline mr-0" /></span>
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-800">
              Отмена заказа
            </h3>
          </div>
          <button
            onClick={hideModal}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-red-500 text-xl mt-0.5"><img src="/images/predup.png" alt="предупреждение" className="w-4 h-4 inline mr-5" /></span>
              <div>
                <h4 className="font-semibold text-red-700 mb-1">Внимание!</h4>
                <p className="text-red-600 text-sm">
                  Вы собираетесь отменить заказ #{modal.order.id}. После отмены восстановить заказ будет невозможно.
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Номер заказа:</span>
              <span className="font-semibold">#{modal.order.id}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Дата заказа:</span>
              <span className="font-semibold">{modal.order.date}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Статус:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                {status.text}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Сумма заказа:</span>
              <span className="font-semibold text-gold-600">
                {modal.order.total?.toLocaleString()} ₽
              </span>
            </div>

            {/* Items Preview */}
            {modal.order.items && modal.order.items.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Товары в заказе:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {modal.order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img 
                        src={item.images?.[0] || '/images/placeholder.jpg'} 
                        alt={item.name}
                        className="w-8 h-8 object-cover rounded border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity || 1} шт. × {item.price?.toLocaleString()} ₽
                        </p>
                      </div>
                    </div>
                  ))}
                  {modal.order.items.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      и еще {modal.order.items.length - 3} товар(ов)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <div className={`mb-6 p-4 rounded-lg transition-all duration-300 ${showConfirmationError ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                id="confirm-cancel"
                checked={isConfirmed}
                onChange={(e) => {
                  setIsConfirmed(e.target.checked);
                  setShowConfirmationError(false);
                }}
                className={`mt-1 w-5 h-5 text-gold-600 focus:ring-gold-500 focus:ring-offset-0 rounded transition-all ${
                  showConfirmationError ? 'border-2 border-red-500' : 'border-gray-300'
                }`}
              />
              <span className={`text-sm transition-colors ${showConfirmationError ? 'text-red-700' : 'text-gray-700'}`}>
                Я понимаю, что отмена заказа является окончательной и восстановить заказ будет невозможно
              </span>
            </label>
            
            {/* Error message for confirmation */}
            {showConfirmationError && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg animate-fadeIn">
                <div className="flex items-center space-x-2 text-red-700">
                  <span><img src="/images/crest.png" alt="крестик" className="w-5 h-5 inline mr-2" /></span>
                  <span className="text-sm font-medium">
                    Без подтверждения заказ отменить нельзя. Пожалуйста, поставьте галочку для подтверждения.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row-reverse space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
            <button
              onClick={handleCancelOrder}
              disabled={modal.order.status === 'cancelled'}
              className={`w-full sm:w-auto py-3 px-6 rounded-lg font-semibold transition-colors ${
                modal.order.status === 'cancelled'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isConfirmed
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-red-400 text-white cursor-not-allowed opacity-75'
              }`}
            >
              {modal.order.status === 'cancelled' ? 'Уже отменен' : 'Да, отменить заказ'}
            </button>
            
            <button
              onClick={hideModal}
              className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Вернуться к заказам
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center">
              <span className="mr-2">•</span> 
              Отмена заказа возможна только до момента его отправки
            </p>
            <p className="flex items-center">
              <span className="mr-2">•</span> 
              Деньги будут возвращены в течение 3-5 рабочих дней
            </p>
            <p className="flex items-center">
              <span className="mr-2">•</span> 
              Для получения помощи свяжитесь с нашей службой поддержки
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
