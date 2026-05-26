import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CollectionDetail = () => {
  const { id } = useParams();
  const { addToCart } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  
  // Метаданные коллекций (название, описание, изображение)
  const collectionsMeta = {
    luna: {
      name: 'Лунная коллекция',
      description: 'Нежные украшения, вдохновленные лунным светом и магией ночного неба. Каждое изделие отражает элегантность и таинственность луны.',
      image: '/images/luna-collection.jpg',
      bannerImage: '/images/luna-collection.jpg'
    },
    solaris: {
      name: 'Солнечная коллекция',
      description: 'Яркие и энергичные украшения, наполненные теплом и светом солнца. Идеально подходят для уверенных и жизнерадостных людей.',
      image: '/images/solar-collection.jpg',
      bannerImage: '/images/solar-collection.jpg'
    },
    planet: {
      name: 'Планетарная коллекция',
      description: 'Космическая элегантность в каждом изделии. Украшения, вдохновленные тайнами и красотой планет нашей солнечной системы.',
      image: '/images/planet-collection.jpg',
      bannerImage: '/images/planet-collection.jpg'
    },
    polarlights: {
      name: 'Коллекция Северное сияние',
      description: 'Завораживающие переливы цветов северного сияния в изысканных украшениях. Холодные оттенки и мерцающие камни создают неповторимый образ.',
      image: '/images/polarlights-collection.jpg',
      bannerImage: '/images/polarlights-collection.jpg'
    }
  };

  // Загружаем товары из API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products.php');
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error('Неверный формат ответа API');
          setProducts([]);
          return;
        }

        // Фильтруем товары по текущей коллекции (id из URL)
        const filtered = data.filter(product => product.collection === id);
        setProducts(filtered);
      } catch (err) {
        console.error('Ошибка загрузки товаров для коллекции:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProducts();
    }
  }, [id]);

  // Сортировка товаров
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const currentCollection = collectionsMeta[id];
  const collectionName = currentCollection?.name || (id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Коллекция');
  const collectionDescription = currentCollection?.description || 'Украшения из этой коллекции';
  const bannerImage = currentCollection?.bannerImage || currentCollection?.image || '/images/placeholder-collection.jpg';

  const getCollectionBadgeStyle = (collectionId) => {
    const styles = {
      luna: 'bg-blue-100 text-blue-800 border-blue-200',
      solaris: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      planet: 'bg-purple-100 text-purple-800 border-purple-200',
      polarlights: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent'
    };
    return styles[collectionId] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-80 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-gold-600">Главная</Link>
        <span className="mx-2">›</span>
        <Link to="/collections" className="hover:text-gold-600">Коллекции</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800 font-medium">{collectionName}</span>
      </nav>

      {/* Баннер коллекции */}
      <div className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-700">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 border ${getCollectionBadgeStyle(id)}`}>
              Коллекция
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
              {collectionName}
            </h1>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {collectionDescription}
            </p>
            <div className="flex items-center gap-4 text-white">
              <span className="text-xl font-bold">{products.length} товаров</span>
            </div>
          </div>
          <div className="lg:w-1/2">
            <img 
              src={bannerImage} 
              alt={collectionName}
              className="w-full h-64 lg:h-96 object-cover"
              onError={(e) => { e.target.src = '/images/placeholder-collection.jpg'; }}
            />
          </div>
        </div>
      </div>

      {/* Заголовок и сортировка */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold">Товары коллекции</h2>
        <div className="relative w-full sm:w-auto">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-48 appearance-none bg-white border rounded px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">Сортировать</option>
            <option value="price">По цене</option>
            <option value="name">По названию</option>
          </select>
        </div>
      </div>

      {/* Сетка товаров */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">В этой коллекции пока нет товаров</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
              <Link to={`/product/${product.id}`}>
                <img 
                  src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
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
                    className={`bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded text-sm transition-colors ${
                      !product.in_stock ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {product.in_stock ? 'В корзину' : 'Нет в наличии'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;