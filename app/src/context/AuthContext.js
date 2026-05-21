import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useModal } from './ModalContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const { showModal } = useModal();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = '/api/index.php';

  const normalizeProduct = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) return product;
    if (product.image) return { ...product, images: [product.image] };
    return { ...product, images: ['/images/placeholder.jpg'] };
  };

  // ========== СОХРАНЕНИЕ НА СЕРВЕР (через ?token=) ==========

  const saveCartToServer = useCallback(async (cartItems) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}?route=cart&token=${encodeURIComponent(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems })
      });
    } catch (err) {
      console.error('Ошибка сохранения корзины:', err);
    }
  }, [token]);

  const saveFavoritesToServer = useCallback(async (favItems) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}?route=favorites&token=${encodeURIComponent(token)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: favItems })
      });
    } catch (err) {
      console.error('Ошибка сохранения избранного:', err);
    }
  }, [token]);

  const loadCartFromServer = useCallback(async (authToken) => {
    try {
      const response = await fetch(`${API_URL}?route=cart&token=${encodeURIComponent(authToken)}`);
      const data = await response.json();
      if (data.cart && Array.isArray(data.cart)) setCart(data.cart);
    } catch (err) {
      console.error('Ошибка загрузки корзины:', err);
    }
  }, []);

  const loadFavoritesFromServer = useCallback(async (authToken) => {
    try {
      const response = await fetch(`${API_URL}?route=favorites&token=${encodeURIComponent(authToken)}`);
      const data = await response.json();
      if (data.favorites && Array.isArray(data.favorites)) setFavorites(data.favorites);
    } catch (err) {
      console.error('Ошибка загрузки избранного:', err);
    }
  }, []);

  const loadOrdersFromServer = useCallback(async (authToken) => {
    try {
      const response = await fetch(`${API_URL}?route=orders&token=${encodeURIComponent(authToken)}`);
      const data = await response.json();
      if (data.orders && Array.isArray(data.orders)) setOrders(data.orders);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
    }
  }, []);

  // ========== АВТОРИЗАЦИЯ ==========

  const register = useCallback(async (userData) => {
    try {
      const url = `${API_URL}?route=register&username=${encodeURIComponent(userData.username)}&email=${encodeURIComponent(userData.email)}&password=${encodeURIComponent(userData.password)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        setCart(data.user?.cart || []);
        setFavorites(data.user?.favorites || []);
        setOrders(data.user?.orders || []);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const url = `${API_URL}?route=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        setCart(data.user?.cart || []);
        setFavorites(data.user?.favorites || []);
        setOrders(data.user?.orders || []);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const quickLogin = useCallback(async () => {
    try { return await login('demo@luna-aurea.com', 'demo123'); }
    catch (error) {
      await register({ username: 'DemoUser', email: 'demo@luna-aurea.com', password: 'demo123' });
      return await login('demo@luna-aurea.com', 'demo123');
    }
  }, [login, register]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null); setUser(null); setCart([]); setFavorites([]); setOrders([]);
  }, []);

  // ========== КОРЗИНА ==========

  const addToCart = useCallback((product) => {
    const normalized = normalizeProduct(product);
    const existing = cart.find(item => item.id === normalized.id);
    let newCart;
    let message = '';
    if (existing) {
      newCart = cart.map(item => item.id === normalized.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item);
      message = `Количество "${normalized.name}" увеличено!`;
    } else {
      newCart = [...cart, { ...normalized, quantity: 1 }];
      message = `"${normalized.name}" добавлен в корзину!`;
    }
    setCart(newCart);
    saveCartToServer(newCart);
    showModal('cart', normalized, message);
  }, [cart, showModal, saveCartToServer]);

  const removeFromCart = useCallback((productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    saveCartToServer(newCart);
  }, [cart, saveCartToServer]);

  // ========== ИЗБРАННОЕ ==========

  const addToFavorites = useCallback((product) => {
    const normalized = normalizeProduct(product);
    if (!favorites.some(item => item.id === normalized.id)) {
      const newFav = [...favorites, normalized];
      setFavorites(newFav);
      saveFavoritesToServer(newFav);
      showModal('favorites', normalized, `"${normalized.name}" добавлен в избранное!`);
      return true;
    }
    return false;
  }, [favorites, showModal, saveFavoritesToServer]);

  const removeFromFavorites = useCallback((productId) => {
    const newFav = favorites.filter(item => item.id !== productId);
    setFavorites(newFav);
    saveFavoritesToServer(newFav);
  }, [favorites, saveFavoritesToServer]);

  const isInFavorites = useCallback((productId) => {
    return favorites.some(item => item.id === productId);
  }, [favorites]);

  // ========== ЗАКАЗЫ ==========

  const createOrder = useCallback(async (orderData) => {
    if (!token) return null;
    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ru-RU'),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      status: 'processing',
      address: orderData.address || '',
      phone: orderData.phone || '',
      payment: orderData.payment || 'card'
    };
    const newOrders = [newOrder, ...orders];
    setOrders(newOrders);
    setCart([]);
    try {
      await fetch(`${API_URL}?route=orders&token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      await saveCartToServer([]);
    } catch (err) {
      console.error('Ошибка сохранения заказа:', err);
    }
    return newOrder;
  }, [cart, orders, token, saveCartToServer]);

  const cancelOrder = useCallback((orderId) => {
    setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'cancelled' } : order));
  }, [orders]);

  const isAuthenticated = useCallback(() => !!user && !!token, [user, token]);

  // ========== ЗАГРУЗКА ПРИ СТАРТЕ ==========

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        await loadCartFromServer(savedToken);
        await loadFavoritesFromServer(savedToken);
        await loadOrdersFromServer(savedToken);
      }
      setLoading(false);
    };
    initAuth();
  }, [loadCartFromServer, loadFavoritesFromServer, loadOrdersFromServer]);

  return (
    <AuthContext.Provider value={{
      user, token, cart, favorites, orders, loading,
      register, login, quickLogin, logout, isAuthenticated,
      addToCart, removeFromCart, addToFavorites, removeFromFavorites, isInFavorites,
      createOrder, cancelOrder
    }}>
      {children}
    </AuthContext.Provider>
  );
};