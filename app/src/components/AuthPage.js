
// components/AuthPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
//Импорт и вызов useAuth()
const AuthPage = () => {
  const { register, login, quickLogin } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccessMessage('');
  };
//Обработчик отправки формы (handleSubmit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        await login(formData.email, formData.password);
        setSuccessMessage('Успешный вход! Перенаправление...');
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        // Валидация регистрации
        if (!formData.username || formData.username.length < 2) {
          throw new Error('Имя пользователя должно содержать минимум 2 символа');
        }
        if (!formData.email || !formData.email.includes('@')) {
          throw new Error('Введите корректный email');
        }
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Пароль должен содержать минимум 6 символов');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Пароли не совпадают');
        }

        console.log('Attempting registration with:', formData);
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        setSuccessMessage('Регистрация успешна! Вы будете перенаправлены в профиль...');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-gray-900">
          {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? 'Еще нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button
            onClick={switchMode}
            className="font-medium text-gold-600 hover:text-gold-500"
          >
            {isLogin ? 'Зарегистрируйтесь' : 'Войдите'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm">
                {successMessage}
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Имя пользователя
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required={!isLogin}
                    value={formData.username}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    placeholder="Введите ваше имя"
                    minLength="2"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email адрес
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  placeholder="Введите пароль"
                  minLength="6"
                />
                {!isLogin && (
                  <p className="mt-1 text-xs text-gray-500">
                    Минимум 6 символов
                  </p>
                )}
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Подтвердите пароль
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    placeholder="Повторите пароль"
                    minLength="6"
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gold-600 hover:bg-gold-700'
                }`}
              >
                {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
