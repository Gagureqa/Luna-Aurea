import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Auth props:', { onNavigate });
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      
      // Проверяем, что onNavigate существует перед вызовом
      if (onNavigate && typeof onNavigate === 'function') {
        onNavigate('profile');
      } else {
        // Используем useNavigate для мгновенной навигации
        navigate('/profile');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: ''
    });
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-serif font-bold text-center mb-8">
        {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium mb-2">Имя пользователя</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="Введите имя пользователя"
              required
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
            placeholder="example@mail.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Пароль</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
            placeholder="Введите пароль"
            minLength="6"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold-600 hover:bg-gold-700 disabled:bg-gray-400 text-white py-3 rounded font-semibold transition-colors"
        >
          {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={switchMode}
          className="text-gold-600 hover:text-gold-700 font-medium"
        >
          {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
};

export default Auth;