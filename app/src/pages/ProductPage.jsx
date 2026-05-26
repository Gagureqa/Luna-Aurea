import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductPage = () => {
const { id } = useParams();
const { addToCart, addToFavorites, removeFromFavorites, isInFavorites } = useAuth();
const [product, setProduct] = useState(null);
const [loading, setLoading] = useState(true);
const [selectedImage, setSelectedImage] = useState(0);
const [isFavorite, setIsFavorite] = useState(false);

useEffect(() => {
  setLoading(true);
  let cancelled = false;
  const delay = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!cancelled) {
      const found = product.find(p => p.id === parseInt(id));
      if (found) {
        setProduct(found);
        setIsFavorite(isInFavorites(found.id));
      } else {
        setProduct(null);
      }
      setLoading(false);
    }
  };
  delay();
  return () => { cancelled = true; };
}, [id, isInFavorites]);

const handleAddToFavorites = () => {
if (product) {
if (isFavorite) {
removeFromFavorites(product.id);
setIsFavorite(false);
} else {
addToFavorites(product);
setIsFavorite(true);
}
}
};

const getCollectionName = (collection) => {
const map = {
luna: 'LUNA',
solaris: 'SOLARIS',
polarlights: 'POLAR LIGHTS',
planet: 'PLANET'
};
return map[collection] || collection?.toUpperCase();
};

const getCollectionBadgeStyle = (collection) => {
const styles = {
luna: 'bg-blue-100 text-blue-800',
solaris: 'bg-yellow-100 text-yellow-800',
polarlights: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
planet: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
};
return styles[collection] || 'bg-gray-100 text-gray-800';
};

const getCategoryName = (category) => {
const map = {
rings: 'Кольца',
earrings: 'Серьги',
necklaces: 'Колье',
bracelets: 'Браслеты',
sets: 'Комплекты',
brooches: 'Броши'
};
return map[category] || category;
};

const getCategoryParam = (category) => {
const revMap = {
'Кольца': 'rings',
'Серьги': 'earrings',
'Колье': 'necklaces',
'Браслеты': 'bracelets',
'Комплекты': 'sets',
'Броши': 'brooches'
};
return revMap[getCategoryName(category)] || category;
};

if (loading) {
return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div><div className="h-96 bg-gray-200 rounded-lg mb-4"></div><div className="grid grid-cols-4 gap-2">{[...Array(4)].map((_,i)=><div key={i} className="h-20 bg-gray-200 rounded"></div>)}</div></div>
            <div><div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div><div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div><div className="space-y-3 mb-6"><div className="h-4 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-1/3"></div></div><div className="h-12 bg-gray-200 rounded mb-4"></div><div className="h-12 bg-gray-200 rounded"></div></div>
          </div>
        </div>
      </div>
    );
  }
if (!product) {
return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Товар не найден</h1>
        <p className="text-gray-600">Извините, запрашиваемый товар не существует.</p>
      </div>
    );
  }
const images = product.images && product.images.length ? product.images : ['/images/placeholder.jpg'];

return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-gold-600">Главная</Link>
        <span className="mx-2">›</span>
        <Link to="/catalog" className="hover:text-gold-600">Каталог</Link>
        <span className="mx-2">›</span>
        <Link to={`/collections/${product.collection}`} className="hover:text-gold-600 capitalize">
          {getCollectionName(product.collection)}
        </Link>
        <span className="mx-2">›</span>
        <Link to={`/catalog?category=${getCategoryParam(product.category)}`} className="hover:text-gold-600 capitalize">
          {getCategoryName(product.category)}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </nav>      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-96 object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`border-2 rounded-lg overflow-hidden transition-all ${selectedImage === idx ? 'border-gold-600 shadow-md' : 'border-gray-200 hover:border-gold-400'}`}>
                <img src={img} alt={`${product.name} ${idx+1}`} className="w-full h-20 object-cover" />
              </button>
            ))}
          </div>
        </div>        <div>
          <div className="mb-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCollectionBadgeStyle(product.collection)}`}>
              Коллекция {getCollectionName(product.collection)}
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold mb-4 text-gray-800">{product.name}</h1>
          <p className="text-2xl text-gold-600 font-bold mb-6">{product.price.toLocaleString()} ₽</p>          <div className="space-y-3 mb-6">
            {product.material && <div className="flex items-center"><span className="w-6 text-gold-600">●</span><span className="ml-2">Материал: <strong>{product.material}</strong></span></div>}
            {product.length && <div className="flex items-center"><span className="w-6 text-gold-600">●</span><span className="ml-2">Длина: <strong>{product.length}</strong></span></div>}
            {product.size && <div className="flex items-center"><span className="w-6 text-gold-600">●</span><span className="ml-2">Размер: <strong>{product.size}</strong></span></div>}
            {product.weight && <div className="flex items-center"><span className="w-6 text-gold-600">●</span><span className="ml-2">Вес: <strong>{product.weight}</strong></span></div>}
            <div className="flex items-center"><span className="w-6 text-gold-600">●</span><span className="ml-2">Наличие: <strong className={product.in_stock ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>{product.in_stock ? 'В наличии' : 'Нет в наличии'}</strong></span></div>
          </div>          <div className="space-y-4 mb-8">
            <button onClick={() => addToCart(product)} disabled={!product.in_stock} className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${product.in_stock ? 'bg-gold-600 hover:bg-gold-700 text-white shadow-lg hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              {product.in_stock ? 'ДОБАВИТЬ В КОРЗИНУ' : 'НЕТ В НАЛИЧИИ'}
            </button>
            <button onClick={handleAddToFavorites} className={`w-full border-2 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${isFavorite ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-gold-600 text-gold-600 hover:bg-gold-50'}`}>
              <img src={isFavorite ? "/images/heartf.png" : "/images/heart.png"} alt={isFavorite ? "В избранном" : "Добавить в избранное"} className="w-5 h-5 inline mr-2" />
              {isFavorite ? 'УДАЛИТЬ ИЗ ИЗБРАННОГО' : 'ДОБАВИТЬ В ИЗБРАННОЕ'}
            </button>
          </div>          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Описание</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{product.description || 'Нет описания'}</p>
          </div>          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-800">Дополнительная информация</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Бесплатная доставка при заказе от 10 000 ₽</li>
              <li>• Гарантия качества 1 год</li>
              <li>• Возврат в течение 14 дней</li>
              <li>• Подарочная упаковка включена</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductPage;