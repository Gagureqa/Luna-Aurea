import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const Profile = () => {
const {
user,
logout,
cart,
removeFromCart,
favorites,
removeFromFavorites,
orders,
createOrder,
cancelOrder
} = useAuth();

const { showModal } = useModal();
const navigate = useNavigate();
const location = useLocation();
const [activeTab, setActiveTab] = useState('profile');
const [checkoutData, setCheckoutData] = useState({
cardNumber: '',
address: ''
});
const [isSubmitting, setIsSubmitting] = useState(false);
const [toastMessage, setToastMessage] = useState(null);

// Toast уведомления
useEffect(() => {
if (toastMessage) {
const timer = setTimeout(() => setToastMessage(null), 3000);
return () => clearTimeout(timer);
}
}, [toastMessage]);

// Обработка параметров таба из URL
useEffect(() => {
const searchParams = new URLSearchParams(location.search);
const tab = searchParams.get('tab');
if (tab && ['cart', 'favorites', 'orders'].includes(tab)) {
setActiveTab(tab);
} else {
setActiveTab('profile');
}
}, [location.search]);

const handleTabChange = (tab) => {
setActiveTab(tab);
if (tab === 'profile') {
navigate('/profile');
} else {
navigate(`/profile?tab=${tab}`);
}
};

const goToCatalog = () => navigate('/catalog');
const goToProduct = (productId) => navigate(`/product/${productId}`);

const getProductImage = (product) => {
if (!product || !product.images || product.images.length === 0) {
return '/images/placeholder.jpg';
}
return product.images[0];
};

const handleCheckout = async (e) => {
e.preventDefault();
if (!cart || cart.length === 0) {
setToastMessage({ type: 'error', text: 'Корзина пуста!' });
return;
}
setIsSubmitting(true);
try {
await new Promise(resolve => setTimeout(resolve, 1500));
const order = createOrder(checkoutData);
setCheckoutData({ cardNumber: '', address: '' });
showModal('order-success', null, 'Заказ успешно оформлен!', order);
} catch (error) {
setToastMessage({ type: 'error', text: 'Произошла ошибка при оформлении заказа' });
} finally {
setIsSubmitting(false);
}
};

const handleCancelOrderClick = (order) => {
if (order.status === 'cancelled') {
setToastMessage({ type: 'warning', text: 'Этот заказ уже отменен' });
return;
}
if (order.status !== 'pending' && order.status !== 'processing') {
setToastMessage({ type: 'error', text: 'Невозможно отменить заказ, который уже обрабатывается или отправлен' });
return;
}
showModal(
'cancel-order',
null,
`Вы уверены, что хотите отменить заказ #${order.id}?`,
order,
(message) => setToastMessage({ type: 'success', text: message }),
(errorMessage) => setToastMessage({ type: 'error', text: errorMessage })
);
};

const getOrderStatus = (status) => {
const statuses = {
pending: { text: 'В обработке', color: 'text-yellow-600', bg: 'bg-yellow-100' },
processing: { text: 'В обработке', color: 'text-yellow-600', bg: 'bg-yellow-100' },
completed: { text: 'Завершен', color: 'text-green-600', bg: 'bg-green-100' },
cancelled: { text: 'Отменен', color: 'text-red-600', bg: 'bg-red-100' },
shipped: { text: 'Отправлен', color: 'text-blue-600', bg: 'bg-blue-100' }
};
return statuses[status] || statuses.pending;
};

if (!user) {
return (
      <div className="max-w-md mx-auto mt-16 p-8 text-center">
        <p className="text-lg mb-4">Пожалуйста, войдите в систему</p>
        <button onClick={() => navigate('/auth')} className="bg-gold-600 text-white px-6 py-3 rounded hover:bg-gold-700">
          Войти / Зарегистрироваться
        </button>
      </div>
    );
  }
const totalPrice = cart ? cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) : 0;

return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {toastMessage && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 p-4 rounded-lg shadow-lg ${
          toastMessage.type === 'success' ? 'bg-green-500 text-white' :
          toastMessage.type === 'error' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
        }`}>
          <div className="flex items-center space-x-3">
            <span>{toastMessage.type === 'success' ? '<img src="/images/galochka.png" alt="Галочка" className="w-5 h-5 inline mr-2" />' : toastMessage.type === 'error' ? '<img src="/images/crest.png" alt="крестик" className="w-5 h-5 inline mr-2" />' : '<img src="/images/predup.png" alt="Предупреждение" className="w-5 h-5 inline mr-2" />'}</span>
            <span className="text-sm sm:text-base">{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="ml-auto text-white hover:text-gray-200">✕</button>
          </div>
        </div>
      )}      <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-6 sm:mb-8">Личный кабинет</h1>      <div className="border-b mb-8">
        <div className="flex space-x-4 sm:space-x-8 overflow-x-auto whitespace-nowrap">
          {['profile', 'cart', 'favorites', 'orders'].map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-3 px-1 sm:px-2 text-sm sm:text-base capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-gold-600 text-gold-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'profile' ? 'Профиль' : tab === 'cart' ? 'Корзина' : tab === 'favorites' ? 'Понравилось' : 'Мои заказы'}
            </button>
          ))}
        </div>
      </div>
{/* Profile Tab */}
{activeTab === 'profile' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Информация о профиле</h2>
            <div className="space-y-3 text-sm sm:text-base">
              <p><strong>Имя пользователя:</strong> {user.username || 'Пользователь'}</p>
              <p><strong>Email:</strong> {user.email || 'Не указан'}</p>
              
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 sm:px-6 sm:py-2 rounded text-sm sm:text-base">
              Выйти
            </button>
          </div>
        </div>
      )}
{/* Cart Tab */}
{activeTab === 'cart' && (
        <div>
          {!cart || cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg sm:text-xl text-gray-500 mb-4">Корзина пуста</p>
              <button onClick={goToCatalog} className="bg-gold-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded hover:bg-gold-700 text-sm sm:text-base">
                Перейти к покупкам
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Товары в корзине</h2>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center bg-white rounded-lg shadow-md p-3 sm:p-4">
                      <img src={getProductImage(item)} alt={item.name} className="w-full sm:w-16 md:w-20 h-32 sm:h-16 md:h-20 object-cover rounded cursor-pointer mb-3 sm:mb-0" onClick={() => goToProduct(item.id)} />
                      <div className="sm:ml-4 flex-grow w-full">
                        <h3 className="font-semibold cursor-pointer hover:text-gold-600 text-sm sm:text-base" onClick={() => goToProduct(item.id)}>{item.name}</h3>
                        <p className="text-gold-600 font-bold text-sm sm:text-base">{(item.price || 0).toLocaleString()} ₽</p>
                        <p className="text-gray-500 text-xs sm:text-sm">Количество: {item.quantity || 1}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2 self-end sm:self-center mt-2 sm:mt-0 sm:ml-4">✕ Удалить</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-fit">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Оформление заказа</h2>
                <form onSubmit={handleCheckout}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Номер карты</label>
                      <input type="text" placeholder="1234 5678 9012 3456" value={checkoutData.cardNumber} onChange={(e) => setCheckoutData({ ...checkoutData, cardNumber: e.target.value })} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm sm:text-base" required maxLength="19" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Адрес доставки</label>
                      <textarea placeholder="Введите полный адрес доставки" value={checkoutData.address} onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm sm:text-base" rows="3" required />
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-base sm:text-lg font-semibold">
                        <span>Итого:</span>
                        <span>{totalPrice.toLocaleString()} ₽</span>
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting || !cart || cart.length === 0} className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                      isSubmitting || !cart || cart.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gold-600 hover:bg-gold-700 text-white shadow-lg hover:shadow-xl'
                    }`}>
                      {isSubmitting ? <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>ОФОРМЛЕНИЕ...</div> : 'ОФОРМИТЬ ЗАКАЗ'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
{/* Favorites Tab */}
{activeTab === 'favorites' && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Избранные товары</h2>
          {!favorites || favorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg sm:text-xl text-gray-500 mb-4">В избранном пока ничего нет</p>
              <button onClick={goToCatalog} className="bg-gold-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded hover:bg-gold-700 text-sm sm:text-base">
                Перейти к покупкам
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favorites.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={getProductImage(item)} alt={item.name} className="w-full h-48 sm:h-56 md:h-64 object-cover cursor-pointer" onClick={() => goToProduct(item.id)} />
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-base sm:text-lg mb-2 cursor-pointer hover:text-gold-600" onClick={() => goToProduct(item.id)}>{item.name}</h3>
                    <p className="text-gold-600 font-bold text-lg sm:text-xl mb-3">{(item.price || 0).toLocaleString()} ₽</p>
                    <div className="flex justify-between items-center">
                      <button onClick={() => goToProduct(item.id)} className="bg-gold-600 hover:bg-gold-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-xs sm:text-sm">Подробнее</button>
                      <button onClick={() => removeFromFavorites(item.id)} className="text-red-500 hover:text-red-700 p-1 sm:p-2 text-xs sm:text-sm" title="Удалить из избранного">
                        <img src="/images/heartf.png" alt="Удалить" className="w-5 h-5 inline mr-2" /> Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
{/* Orders Tab */}
{activeTab === 'orders' && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Мои заказы</h2>
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4 text-sm sm:text-base">У вас еще нет заказов</p>
              <button onClick={() => handleTabChange('cart')} className="bg-gold-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded hover:bg-gold-700 text-sm sm:text-base">
                Перейти к корзине
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {orders.map(order => {
                const status = getOrderStatus(order.status);
                return (
                  <div key={order.id} className="bg-white rounded-lg shadow-md p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold">Заказ #{order.id}</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">Дата: {order.date}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${status.bg} ${status.color}`}>{status.text}</span>
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button onClick={() => handleCancelOrderClick(order)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-xs sm:text-sm">
                            Отменить заказ
                          </button>
                        )}
                        {order.status === 'cancelled' && <span className="text-red-500 text-xs sm:text-sm">Заказ отменен</span>}
                      </div>
                    </div>
                    <div className="mb-4 text-sm sm:text-base">
                      <p><strong>Адрес доставки:</strong> {order.address}</p>
                      {order.cardNumber && order.cardNumber.length >= 4 && (
                        <p><strong>Карта:</strong> **** {order.cardNumber.slice(-4)}</p>
                      )}
                      <p><strong>Итого:</strong> {(order.total || 0).toLocaleString()} ₽</p>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 text-sm sm:text-base">Товары в заказе:</h4>
                      <div className="space-y-3">
                        {order.items?.map(item => (
                          <div key={item.id} className="flex items-center text-sm">
                            <img src={getProductImage(item)} alt={item.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0" />
                            <div className="ml-3 flex-grow">
                              <p className="font-medium text-xs sm:text-sm">{item.name}</p>
                              <p className="text-xs text-gray-500">{(item.price || 0).toLocaleString()} ₽ × {item.quantity || 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Profile;