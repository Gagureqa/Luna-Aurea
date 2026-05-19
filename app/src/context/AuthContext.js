// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useModal } from './ModalContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { showModal } = useModal();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);

  // ✅ Нормализация товара: приводит к формату с полем images (массив)
  const normalizeProduct = (product) => {
    // Если уже есть images и это непустой массив, возвращаем как есть
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product;
    }
    // Если есть поле image (строка), создаём массив с одним элементом
    if (product.image && typeof product.image === 'string') {
      return { ...product, images: [product.image] };
    }
    // Если нет ни images, ни image, ставим заглушку
    return { ...product, images: ['/images/placeholder.jpg'] };
  };

  // Генерация токена
  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  // Восстановление сессии из localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      const savedCart = localStorage.getItem('cart');
      const savedFavorites = localStorage.getItem('favorites');
      const savedOrders = localStorage.getItem('orders');

      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);
          
          if (savedCart) {
            const cartData = JSON.parse(savedCart);
            setCart(Array.isArray(cartData) ? cartData : []);
          }
          
          if (savedFavorites) {
            const favoritesData = JSON.parse(savedFavorites);
            setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
          }
          
          if (savedOrders) {
            const ordersData = JSON.parse(savedOrders);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
          }
        } catch (error) {
          console.error('Error parsing saved data:', error);
          clearAuthData();
        }
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
    setCart([]);
    setFavorites([]);
    setOrders([]);
  };

  // Регистрация
  const register = useCallback(async (userData) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userExists = existingUsers.some(u => u.email === userData.email);
      
      if (userExists) {
        throw new Error('Пользователь с таким email уже существует');
      }

      if (userData.password.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов');
      }

      const newUser = {
        id: Date.now().toString(),
        username: userData.username || userData.email.split('@')[0],
        email: userData.email,
        password: userData.password, // В реальном проекте хэшировать!
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      const authToken = generateToken();
      setToken(authToken);
      setUser(newUser);
      
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));

      return { user: newUser, token: authToken };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, []);

  // Вход
  const login = useCallback(async (email, password) => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Неверный email или пароль');
      }

      const authToken = generateToken();
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;

      setToken(authToken);
      setUser(userWithoutPassword);
      
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      
      const savedCart = localStorage.getItem('cart');
      const savedFavorites = localStorage.getItem('favorites');
      const savedOrders = localStorage.getItem('orders');
      
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      
      return { user: userWithoutPassword, token: authToken };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // Быстрый вход
  const quickLogin = useCallback(async () => {
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'test123';
      
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const testUserExists = existingUsers.some(u => u.email === testEmail);
      
      if (!testUserExists) {
        const testUser = {
          id: 'test-user-123',
          username: 'testuser',
          email: testEmail,
          password: testPassword,
          createdAt: new Date().toISOString()
        };
        const updatedUsers = [...existingUsers, testUser];
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      }
      
      return login(testEmail, testPassword);
    } catch (error) {
      console.error('Quick login failed:', error);
      throw error;
    }
  }, [login]);

  // Выход
  const logout = useCallback(() => {
    clearAuthData();
  }, []);

  // Сохранение данных при изменении
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('favorites', JSON.stringify(favorites));
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }, [cart, favorites, orders, user, token]);

  // ✅ Добавление в корзину (с нормализацией)
  const addToCart = useCallback((product) => {
    const normalizedProduct = normalizeProduct(product);
    const existingItem = cart.find(item => item.id === normalizedProduct.id);
    let newCart;
    let message = '';
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === normalizedProduct.id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      );
      message = `Количество "${normalizedProduct.name}" увеличено!`;
    } else {
      newCart = [...cart, { ...normalizedProduct, quantity: 1 }];
      message = `"${normalizedProduct.name}" добавлен в корзину!`;
    }
    
    setCart(newCart);
    showModal('cart', normalizedProduct, message);
  }, [cart, showModal]);

  // ✅ Удаление из корзины
  const removeFromCart = useCallback((productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
  }, [cart]);

  // ✅ Добавление в избранное (с нормализацией)
  const addToFavorites = useCallback((product) => {
    const normalizedProduct = normalizeProduct(product);
    const isAlreadyFavorite = favorites.some(item => item.id === normalizedProduct.id);
    
    if (!isAlreadyFavorite) {
      const newFavorites = [...favorites, normalizedProduct];
      setFavorites(newFavorites);
      showModal('favorites', normalizedProduct, `"${normalizedProduct.name}" добавлен в избранное!`);
      return true;
    }
    return false;
  }, [favorites, showModal]);

  // ✅ Удаление из избранного
  const removeFromFavorites = useCallback((productId) => {
    const newFavorites = favorites.filter(item => item.id !== productId);
    setFavorites(newFavorites);
  }, [favorites]);

  const isInFavorites = useCallback((productId) => {
    return favorites.some(item => item.id === productId);
  }, [favorites]);

  // Заказы
  const createOrder = useCallback((orderData) => {
    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ru-RU'),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      status: 'pending',
      address: orderData.address,
      cardNumber: orderData.cardNumber,
    };

    const newOrders = [newOrder, ...orders];
    setOrders(newOrders);
    setCart([]); // очищаем корзину
    return newOrder;
  }, [cart, orders]);

  const cancelOrder = useCallback((orderId) => {
    const newOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    );
    setOrders(newOrders);
    return newOrders;
  }, [orders]);

  const isAuthenticated = useCallback(() => {
    return !!user && !!token;
  }, [user, token]);

  const value = {
    user,
    token,
    cart,
    favorites,
    orders,
    register,
    login,
    quickLogin,
    logout,
    isAuthenticated,
    addToCart,
    removeFromCart,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    createOrder,
    cancelOrder
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};