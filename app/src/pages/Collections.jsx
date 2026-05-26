import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const { addToCart } = useAuth();

  // Метаданные коллекций (название, описание, изображение)
  const collectionsMeta = {
    luna: {
      name: 'Лунная коллекция',
      description: 'Нежные украшения, вдохновленные лунным светом',
      image: '/images/luna-collection.jpg'
    },
    solaris: {
      name: 'Солнечная коллекция',
      description: 'Яркие и энергичные украшения',
      image: '/images/solar-collection.jpg'
    },
    planet: {
      name: 'Планетарная коллекция',
      description: 'Космическая элегантность в каждом изделии',
      image: '/images/planet-collection.jpg'
    },
    polarlights: {
      name: 'Северное сияние',
      description: 'Завораживающие переливы цветов',
      image: '/images/polarlights-collection.jpg'
    }
  };

  useEffect(() => {
    const fetchProductsAndBuildCollections = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products.php');
        const products = await res.json();
        if (!Array.isArray(products)) {
          console.error('Неверный формат ответа API');
          setCollections([]);
          return;
        }

        // Группируем товары по коллекциям
        const grouped = {};
        products.forEach(product => {
          const collId = product.collection;
          if (!collId || !collectionsMeta[collId]) return; // игнорируем товары без коллекции или с неизвестной коллекцией
          if (!grouped[collId]) {
            grouped[collId] = [];
          }
          grouped[collId].push(product);
        });

        // Преобразуем группировку в массив объектов коллекций
        const collectionsArray = Object.entries(grouped).map(([id, products]) => ({
          id,
          name: collectionsMeta[id].name,
          description: collectionsMeta[id].description,
          image: collectionsMeta[id].image,
          products: products.sort((a, b) => a.id - b.id) // сортируем по id для стабильности
        }));

        setCollections(collectionsArray);
      } catch (err) {
        console.error('Ошибка загрузки товаров для коллекций:', err);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndBuildCollections();
  }, []);

  const sortedCollections = [...collections].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'products') return b.products.length - a.products.length;
    return 0;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold">Коллекции</h1>
        
        <div className="relative w-full sm:w-auto">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-48 appearance-none bg-white border rounded px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">Сортировать</option>
            <option value="name">По названию</option>
            <option value="products">По количеству товаров</option>
          </select>
        </div>
      </div>

      {/* Сетка коллекций */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {sortedCollections.map((collection) => (
          <div key={collection.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300">
            <Link to={`/collections/${collection.id}`}>
              <div className="relative overflow-hidden">
                <img 
                  src={collection.image} 
                  alt={collection.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => { e.target.src = '/images/placeholder-collection.jpg'; }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
              </div>
            </Link>
            
            <div className="p-4 sm:p-6">
              <Link to={`/collections/${collection.id}`}>
                <h2 className="font-serif text-xl font-bold mb-2 hover:text-gold-600 transition-colors">
                  {collection.name}
                </h2>
              </Link>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {collection.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  {collection.products.length} товаров
                </span>
                <Link 
                  to={`/collections/${collection.id}`}
                  className="text-gold-600 hover:text-gold-700 font-medium text-sm transition-colors"
                >
                  Смотреть все →
                </Link>
              </div>

              {/* Превью товаров коллекции */}
              <div className="grid grid-cols-2 gap-2 border-t pt-4">
                {collection.products.slice(0, 2).map((product) => (
                  <div key={product.id} className="text-center">
                    <Link to={`/product/${product.id}`}>
                      <img 
                        src={product.images && product.images[0] ? product.images[0] : '/images/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-20 object-cover rounded mb-2 hover:opacity-80 transition-opacity"
                        onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                      />
                    </Link>
                    <p className="text-xs font-medium truncate">{product.name}</p>
                    <p className="text-gold-600 font-bold text-sm">
                      {product.price.toLocaleString()} ₽
                    </p>
                  </div>
                ))}
              </div>
              {collection.products.length > 0 && (
                <button
                  onClick={() => addToCart(collection.products[0])}
                  className="w-full mt-4 bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  Добавить в корзину от {collection.products[0].price.toLocaleString()} ₽
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {collections.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Коллекции временно недоступны</p>
        </div>
      )}
    </div>
  );
};

export default Collections;