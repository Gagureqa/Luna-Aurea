// components/ProductModal.js
import React, { useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductModal = () => {
  const { modal, hideModal } = useModal();
  const { cart, favorites } = useAuth();
  const navigate = useNavigate();

  // Закрытие по ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        hideModal();
      }
    };

    if (modal.isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modal.isOpen, hideModal]);

  if (!modal?.isOpen || !modal?.product || modal.type === 'order-success') return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      hideModal();
    }
  };

  const handleGoToCart = () => {
    hideModal();
    navigate('/profile?tab=cart');
  };

  const handleGoToFavorites = () => {
    hideModal();
    navigate('/profile?tab=favorites');
  };

  const handleContinueShopping = () => {
    hideModal();
  };

  // ✅ Вспомогательная функция для получения изображения
  const getProductImage = (product) => {
    if (!product) return '/images/placeholder.jpg';
    if (product.images && Array.isArray(product.images) && product.images[0]) {
      return product.images[0];
    }
    if (product.image) return product.image;
    return '/images/placeholder.jpg';
  };

  const getModalConfig = () => {
    const configs = {
      cart: {
        title: 'Товар добавлен в корзину!',
        icon: <img src="/images/kart.png" alt="корзина" className="w-5 h-5 flex" />,
        buttonText: 'Перейти в корзину',
        secondaryButtonText: 'Продолжить покупки',
        onPrimaryClick: handleGoToCart,
        onSecondaryClick: handleContinueShopping,
        itemsCount: cart.length,
        itemsText: 'корзине'
      },
      favorites: {
        title: 'Товар добавлен в избранное!',
        icon: <img src="/images/Heart.png" alt="Сердечко" className="w-5 h-5 inline mr-2" /> ,
        buttonText: 'Перейти в избранное',
        secondaryButtonText: 'Продолжить покупки',
        onPrimaryClick: handleGoToFavorites,
        onSecondaryClick: handleContinueShopping,
        itemsCount: favorites.length,
        itemsText: 'избранном'
      }
    };
    return configs[modal.type] || configs.cart;
  };

  const config = getModalConfig();

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
            <span className="text-2xl">{config.icon}</span>
            <h3 className="text-xl font-serif font-bold text-gray-800">
              {config.title}
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
          {/* Product Info */}
          <div className="flex items-center space-x-4 mb-6">
            <img 
              src={getProductImage(modal.product)}
              alt={modal.product.name}
              onError={(e) => { e.target.src = '/images/placeho.jpg'; }}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-lg mb-1">
                {modal.product.name}
              </h4>
              <p className="text-gold-600 font-bold text-xl">
                {modal.product.price?.toLocaleString()} ₽
              </p>
              {modal.message && (
                <p className="text-green-600 text-sm mt-1">
                  {modal.message}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 text-center">
              Теперь в вашей {config.itemsText} {config.itemsCount} товар(ов)
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={config.onPrimaryClick}
              className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              {config.buttonText}
            </button>
            <button
              onClick={config.onSecondaryClick}
              className="w-full border-2 border-gold-600 text-gold-600 hover:bg-gold-50 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              {config.secondaryButtonText}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            Нажмите вне окна или ESC для закрытия
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;