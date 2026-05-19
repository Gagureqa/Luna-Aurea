import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onNavigate }) => {
  const { addToCart } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  
  const handleCardClick = () => {
    onNavigate('product', { id: product.id });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Предотвращаем переход на страницу товара
    addToCart(product);
  };

  const getCollectionColor = (collection) => {
    switch (collection) {
      case 'solaris': return 'bg-yellow-500';
      case 'luna': return 'bg-blue-500';
      case 'premium': return 'bg-purple-500';
      case 'planet': return 'bg-purple-500';
      case 'polarlights' : return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick} // ✅✅✅ И ВЫЗОВИТЕ ЗДЕСЬ ✅✅✅
    >
      {/* Изображение товара */}
      <div className="relative overflow-hidden">
        <img 
  src={product.image} 
  alt={product.name}
  className="w-full h-48 sm:h-64 md:h-80 object-cover group-hover:scale-110 transition-transform duration-500"
/>
        
        {/* Бейдж коллекции */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${getCollectionColor(product.collection)}`}>
            {product.collection?.toUpperCase() || 'CLASSIC'}
          </span>
        </div>
      </div>

      {/* Информация о товаре */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-gold-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-gold-600 font-bold text-xl">
            {product.price.toLocaleString()} ₽
          </span>
          <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
            {product.material}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full bg-gold-600 hover:bg-gold-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
        >
          В корзину
        </button>
      </div>
    </div>
  );
};

export default ProductCard;