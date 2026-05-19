import React, { useState } from 'react';
import { Link } from 'react-router-dom';

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"></div>
const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  // ✅ Исправленные функции навигации (строчные буквы)
  const goToCatalog = () => {
    window.location.href = './catalog';
  };

  const goToOrders = () => {
    window.location.href = './profile?tab=orders';
  };

  const goToCollections = () => {
    window.location.href = './Collections';
  };

  const goToProfile = () => {
    window.location.href = './profile?tab=cart';
  };

  const goToContacts = () => {
    window.location.href = './contacts'
  };
  const goToAbout = () => {
    window.location.href = './About'
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <Link to="./" className="flex items-center">
              <span className="ml-2 text-xl font-serif font-bold">LUNA AUREA</span>
            </Link>
            <p className="text-gray-400">Уникальные украшения ручной работы</p>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-semibold mb-4">МЕНЮ</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={goToCollections}
                  className="text-gray-400 hover:text-white transition-colors text-left hover:underline"
                >
                  Коллекции
                </button>
              </li>
              <li>
                <button
                  onClick={goToCatalog}
                  className="text-gray-400 hover:text-white transition-colors text-left hover:underline"
                >
                  Каталог
                </button>
              </li>
              <li>
                <button
                  onClick={goToAbout}
                  className="text-gray-400 hover:text-white transition-colors text-left hover:underline"
                >
                  О нас
                </button>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-4">ПОМОЩЬ</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/profile?tab=orders" className="text-gray-400 hover:text-white transition-colors hover:underline">
                  Доставка
                </Link>
              </li>
              <li>
                <Link to="/profile?tab=cart" className="text-gray-400 hover:text-white transition-colors hover:underline">
                  Оплата
                </Link>
              </li>
              <li>
                <button
                  onClick={goToContacts}
                  className="text-gray-400 hover:text-white transition-colors text-left hover:underline"
                >
                  Контакты
                </button>
              </li>
            </ul>
          </div>

          {/* Subscription */}
          <div>
            <h4 className="font-semibold mb-4">ПОДПИСКА</h4>
            <p className="text-gray-400 mb-4">Будьте в курсе новинок</p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="Ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 bg-gray-800 text-white rounded-l focus:outline-none focus:ring-2 focus:ring-gold-500 flex-grow"
                required
              />
              <button
                type="submit"
                className="bg-gold-600 hover:bg-gold-700 px-4 py-2 rounded-r transition-colors"
              >
                ✓
              </button>
            </form>
            {subscribed && (
              <div className="mt-2 p-2 bg-green-600 rounded text-sm">
                Спасибо за подписку!
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 LUNA AUREA. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;