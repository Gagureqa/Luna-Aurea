import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Catalog = () => {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [sortBy, setSortBy] = useState('');
const [categoryFilter, setCategoryFilter] = useState('all');
const { addToCart } = useAuth();
const location = useLocation();
const navigate = useNavigate();

// Загрузка товаров из API
useEffect(() => {
const fetchProducts = async () => {
setLoading(true);
try {
const res = await fetch('/api/products.php');
const data = await res.json();
if (Array.isArray(data)) {
setProducts(data);
} else {
console.error('Неверный формат ответа API');
setProducts([]);
}
} catch (err) {
console.error('Ошибка загрузки товаров:', err);
setProducts([]);
} finally {
setLoading(false);
}
};
fetchProducts();
}, []);

// Чтение параметра category из URL при загрузке
useEffect(() => {
const params = new URLSearchParams(location.search);
const categoryParam = params.get('category');
if (categoryParam && ['rings', 'necklaces', 'bracelets', 'earrings', 'sets'].includes(categoryParam)) {
setCategoryFilter(categoryParam);
} else if (categoryParam === 'all') {
setCategoryFilter('all');
}
}, [location.search]);

// При изменении фильтра обновляем URL
useEffect(() => {
const params = new URLSearchParams(location.search);
if (categoryFilter === 'all') {
params.delete('category');
} else {
params.set('category', categoryFilter);
}
const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
navigate(newUrl, { replace: true });
}, [categoryFilter, location.pathname, navigate]);

// Фильтрация по категории
const filteredProducts = categoryFilter === 'all'
? products
: products.filter(product => product.category === categoryFilter);

// Сортировка
const sortedProducts = [...filteredProducts].sort((a, b) => {
if (sortBy === 'price') return a.price - b.price;
if (sortBy === 'popularity') return b.id - a.id;
return 0;
});

const getCategoryCount = (category) => {
if (category === 'all') return products.length;
return products.filter(product => product.category === category).length;
};

const categories = [
{ id: 'all', label: 'Все', icon: null },
{ id: 'rings', label: 'Кольца', icon: <img src="/images/colco.png" alt="кольца" className="w-5 h-5" /> },
{ id: 'necklaces', label: 'Колье', icon: <img src="/images/colie.png" alt="колье" className="w-5 h-5" /> },
{ id: 'bracelets', label: 'Браслеты', icon: <img src="/images/braslets.png" alt="браслеты" className="w-5 h-5" /> },
{ id: 'earrings', label: 'Серьги', icon: <img src="/images/sergi.png" alt="серьги" className="w-5 h-5" /> },
];

const getCollectionBadge = (collection) => {
switch (collection) {
case 'luna': return { name: 'LUNA', className: 'bg-gradient-to-r from-blue-600 to-purple-600' };
case 'solaris': return { name: 'SOLARIS', className: 'bg-gradient-to-r from-gold-600 to-yellow-600' };
case 'planet': return { name: 'PLANET', className: 'bg-gradient-to-r from-purple-600 to-pink-600' };
case 'polarlights': return { name: 'POLAR LIGHTS', className: 'bg-gradient-to-r from-blue-500 to-purple-600' };
default: return { name: collection?.toUpperCase() || '', className: 'bg-gray-600' };
}
};

if (loading) {
return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold">Все украшения</h1>
        <div className="relative w-full sm:w-auto">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-48 appearance-none bg-white border rounded px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">Сортировать</option>
            <option value="price">По цене</option>
            <option value="popularity">По популярности</option>
          </select>
        </div>
      </div>      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 pb-2 border-b border-gray-200">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              categoryFilter === cat.id
                ? 'bg-gold-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              {cat.icon && <span className="text-base">{cat.icon}</span>}
              {cat.label}
              <span className={`ml-1 text-xs ${categoryFilter === cat.id ? 'text-white' : 'text-gray-500'}`}>
                ({getCategoryCount(cat.id)})
              </span>
            </span>
          </button>
        ))}
      </div>
{sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">В этой категории пока нет товаров</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((product) => {
            const badge = getCollectionBadge(product.collection);
            const firstImage = product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg';
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow relative">
                {badge.name && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`text-white text-xs px-2 py-1 rounded-full ${badge.className}`}>
                      {badge.name}
                    </span>
                  </div>
                )}
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={firstImage} 
                    alt={product.name}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold mb-2 hover:text-gold-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center">
                    <p className="text-gold-600 font-bold text-lg">
                      {product.price.toLocaleString()} ₽
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.in_stock}
                      className={`bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded text-sm transition-colors ${!product.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {product.in_stock ? 'В корзину' : 'Нет в наличии'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Catalog;