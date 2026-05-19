import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const { addToCart } = useAuth();

  useEffect(() => {
    const mockCollections = [
      {
        id: "luna",
        name: "Лунная коллекция",
        description: "Нежные украшения, вдохновленные лунным светом",
        image: "/images/luna-collection.jpg",
        products: [
          { id: 1, name: "Серьги Лунное сияние", price: 12500, image: "./images/луна 1.png", category: "earrings" },
          { id: 2, name: "Кольцо Лунный свет", price: 8900, image: "/images/moonlight1.png", category: "rings" }
        ]
      },
      {
        id: "solaris",
        name: "Солнечная коллекция",
        description: "Яркие и энергичные украшения",
        image: "/images/solar-collection.jpg",
        products: [
          { id: 3, name: "Колье Солнечная энергия", price: 25000, image: "/images/колье1.png", category: "necklaces" },
          { id: 9, name: "Браслет Золотое сияние", price: 19200, image: "/images/браслетсолар1.jpg", category: "bracelets" },
          { id: 10, name: "Серьги Белое солнце", price: 19200, image: "/images/серёжкисолар1.jpg", category: "earrings" }
        ]
      },
      {
        id: "planet",
        name: "Планетарная коллекция",
        description: "Космическая элегантность в каждом изделии",
        image: "/images/planet-collection.jpg",
        products: [
          { id: 5, name: "Кольцо Венера", price: 10590, image: "/images/венера1.jpg", category: "rings" },
          { id: 6, name: "Серьги Марс", price: 15500, image: "/images/марс1.jpg", category: "earrings" },
          { id: 7, name: "Колье Юпитер", price: 11900, image: "/images/юпитер1.jpg", category: "necklaces" },
          { id: 8, name: "Браслет Сатурн", price: 11200, image: "/images/сатурн1.jpeg", category: "bracelets" },
        ]
      },
      {
        id: "polarlights",
        name: "Северное сияние",
        description: "Завораживающие переливы цветов",
        image: "/images/polarlights-collection.jpg",
        products: [
          { id: 4, name: "Браслет Северное сияние", price: 11200, image: "/images/браслетик1.png", category: "bracelets" },
        ]
      }
    ];
    setCollections(mockCollections);
  }, []);

  const sortedCollections = [...collections].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'products') return b.products.length - a.products.length;
    return 0;
  });

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
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-20 object-cover rounded mb-2 hover:opacity-80 transition-opacity"
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

      {collections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Коллекции временно недоступны</p>
        </div>
      )}
    </div>
  );
};

export default Collections;