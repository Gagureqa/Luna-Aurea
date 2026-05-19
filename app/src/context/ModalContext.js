
// context/ModalContext.js
import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    type: null, // 'cart', 'favorites', 'order-success', 'cancel-order'
    product: null,
    order: null, // Для cancel-order и order-success
    message: '',
    onSuccess: null,
    onError: null
  });

  const showModal = (type, product = null, message = '', order = null, onSuccess = null, onError = null) => {
    setModal({
      isOpen: true,
      type,
      product,
      order,
      message: message || getDefaultMessage(type, product, order),
      onSuccess,
      onError
    });
  };

  const hideModal = () => {
    setModal({
      isOpen: false,
      type: null,
      product: null,
      order: null,
      message: '',
      onSuccess: null,
      onError: null
    });
  };

  const getDefaultMessage = (type, product, order) => {
    switch (type) {
      case 'cart':
        return `"${product?.name}" добавлен в корзину!`;
      case 'favorites':
        return `"${product?.name}" добавлен в избранное!`;
      case 'order-success':
        return 'Заказ успешно оформлен!';
      case 'cancel-order':
        return `Вы уверены, что хотите отменить заказ #${order?.id}?`;
      default:
        return '';
    }
  };

  const value = {
    modal,
    showModal,
    hideModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
