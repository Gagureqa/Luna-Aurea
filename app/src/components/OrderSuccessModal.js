// components/OrderSuccessModal.js
import React, { useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import { useNavigate } from 'react-router-dom';

const OrderSuccessModal = () => {
  const { modal, hideModal } = useModal();
  const navigate = useNavigate();

  // Закрытие по ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        hideModal();
      }
    };

    if (modal.isOpen && modal.type === 'order-success') {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modal.isOpen, modal.type, hideModal]);

  if (!modal.isOpen || modal.type !== 'order-success') return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      hideModal();
    }
  };

  const handleGoToOrders = () => {
    hideModal();
    navigate('/profile?tab=orders');
  };

  const handleContinueShopping = () => {
    hideModal();
    navigate('/catalog');
  };

  const handleGoToProfile = () => {
    hideModal();
    navigate('/profile');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl"><img src="/images/feir.png" alt="салют" className="w-7 h-7 inline mr-5" /></span>
            <h3 className="text-xl font-serif font-bold text-gray-800">
              Заказ оформлен!
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
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl"><img src="/images/galochka.png" alt="галочка" className="w-10 h-10 inline mr-0" /></span>
            </div>
            <p className="text-green-600 font-semibold text-lg mb-2">
              Оплата прошла успешно!
            </p>
          </div>

          {/* Order Details */}
          {modal.orderData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Номер заказа:</span>
                  <span className="font-semibold">#{modal.orderData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Сумма:</span>
                  <span className="font-semibold text-gold-600">
                    {modal.orderData.total?.toLocaleString()} ₽
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Статус:</span>
                  <span className="font-semibold text-green-600">Обрабатывается</span>
                </div>
                {modal.orderData.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Доставка:</span>
                    <span className="font-semibold text-right max-w-[200px] truncate">
                      {modal.orderData.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items Preview */}
          {modal.orderData?.items && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Товары в заказе:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {modal.orderData.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img 
                      src={item.images?.[0] || '/images/placeholder.jpg'} 
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded border border-gray-200"
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
                {modal.orderData.items.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    и еще {modal.orderData.items.length - 3} товар(ов)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 text-center">
              <img src="/images/zakaz.png" alt="коробочка заказа" className="w-7 h-7 inline mr-5" /> Заказ будет доставлен в течение 3-5 рабочих дней
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleGoToOrders}
              className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <img src="/images/kart.png" alt="корзина" className="w-7 h-7 inline mr-5" /> Перейти к моим заказам
            </button>
            
            <button
              onClick={handleContinueShopping}
              className="w-full border-2 border-gold-600 text-gold-600 hover:bg-gold-50 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              <img src="/images/sumka.png" alt="сумочка" className="w-7 h-7 inline mr-5" /> Продолжить покупки
            </button>

            <button
              onClick={handleGoToProfile}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              <img src="/images/user.png" alt="профиль" className="w-7 h-7 inline mr-5" /> В личный кабинет
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            Спасибо за покупку! С вами свяжется наш менеджер для подтверждения заказа.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;