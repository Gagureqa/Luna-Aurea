import React, { useState } from 'react';
import SupportModal from '../components/SupportModal';

const Contacts = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });
    setIsLoading(true);

    try {
      const response = await fetch('/api/send_contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'contact' })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus({ type: 'success', text: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.' });
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', text: result.error || 'Ошибка отправки. Попробуйте позже.' });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'Ошибка сети. Проверьте соединение.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">Контакты</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Свяжитесь с нами - мы всегда рады помочь вам найти идеальное украшение
          </p>
          <button
            onClick={() => setIsSupportOpen(true)}
            className="mt-4 inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2"><img src="/images/telefon.png" alt="телефон" className="w-7 h-7 flex" /></span> Задать вопрос поддержке
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Контактная информация */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Наши контакты</h2>
            
            <div className="space-y-6">
              {/* Телефон */}
              <div className="flex items-start space-x-4">
                <div className="bg-gold-100 p-3 rounded-full">
                  <span className="text-2xl"><img src="/images/telefon.png" alt="телефон" className="w-7 h-7 flex" /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">Телефон</h3>
                  <p className="text-gray-600">+7 (999) 123-45-67</p>
                  <p className="text-gray-600">+7 (495) 765-43-21</p>
                  <p className="text-sm text-gray-500 mt-1">Ежедневно с 9:00 до 21:00</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="bg-gold-100 p-3 rounded-full">
                  <span className="text-2xl"><img src="/images/pochta.png" alt="почта" className="w-7 h-7 flex" /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">Email</h3>
                  <p className="text-gray-600">luna.aureaa@gmail.com</p>
                  <p className="text-sm text-gray-500 mt-1">Ответим в течение 2 часов</p>
                </div>
              </div>

              {/* Адрес */}
              <div className="flex items-start space-x-4">
                <div className="bg-gold-100 p-3 rounded-full">
                  <span className="text-2xl"><img src="/images/geo.png" alt="Место нахождения" className="w-7 h-7 flex" /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">Адрес магазина</h3>
                  <p className="text-gray-600">Москва, ул. Ювелирная, 1</p>
                  <p className="text-gray-600">ТЦ "Золотой ряд", 2 этаж</p>
                  <p className="text-sm text-gray-500 mt-1">Пн-Вс: 10:00 - 20:00</p>
                </div>
              </div>

              {/* Социальные сети */}
              <div className="flex items-start space-x-4">
                <div className="bg-gold-100 p-3 rounded-full">
                  <span className="text-2xl"><img src="/images/browse.png" alt="соц сети" className="w-7 h-7 flex" /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">Социальные сети</h3>
                  <div className="flex space-x-4 mt-2">
                    <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Telegram
                    </button>
                    <button className="bg-blue-800 text-white p-2 rounded-lg hover:bg-blue-900 transition-colors">
                      VK
                    </button>
                    <button className="bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700 transition-colors">
                      TikTok
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Обратная связь</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="Ваше имя"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Сообщение *</label>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Расскажите, чем мы можем вам помочь..."
                ></textarea>
              </div>

              {status.text && (
                <div className={`p-3 rounded-lg text-sm ${
                  status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {status.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gold-600 hover:bg-gold-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Отправка...' : 'Отправить сообщение'}
              </button>
            </form>
          </div>
        </div>

        {/* Карта и дополнительная информация */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4">Как нас найти</h3>
            <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center overflow-hidden">
              <img 
                src="/images/карта городов.jpg" 
                alt="Карта расположения наших магазинов" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4">Время работы</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Понедельник - Пятница</span>
                <span className="font-semibold">10:00 - 20:00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Суббота</span>
                <span className="font-semibold">11:00 - 19:00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Воскресенье</span>
                <span className="font-semibold">11:00 - 18:00</span>
              </div>
              <div className="mt-6 p-4 bg-gold-50 rounded-lg">
                <p className="text-sm text-gold-800">
                  <img src="/images/star.png" alt="примечание" className="w-5 h-5 inline mr-1" /> 
                  В праздничные дни время работы может меняться. Рекомендуем уточнять по телефону.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6">Частые вопросы</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Есть ли доставка в другие города?</h4>
                <p className="text-gray-600 text-sm">Да, мы доставляем по всей России и в страны СНГ.</p>
              </div>
              <div className="border-b border-gray-100 pb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Можно ли вернуть украшение?</h4>
                <p className="text-gray-600 text-sm">Да, в течение 14 дней при сохранении товарного вида.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Делаете ли вы индивидуальные заказы?</h4>
                <p className="text-gray-600 text-sm">Да, мы создаем украшения по вашим эскизам.</p>
              </div>
              <div className="border-b border-gray-100 pb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Есть ли гарантия на украшения?</h4>
                <p className="text-gray-600 text-sm">Да, гарантия 1 год на все наши изделия.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно поддержки */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
};

export default Contacts;