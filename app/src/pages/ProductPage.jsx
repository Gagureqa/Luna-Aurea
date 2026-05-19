import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // ← Link добавлен
import { useAuth } from '../context/AuthContext';

const allProducts = {
  1: {
    id: 2,
    name: 'Серьги Лунное сияние',
    price: 12500,
    images: ['/images/луна 1.png', '/images/луна 2.png', '/images/луна 3.png', '/images/луна 4.png'],
    description: 'Элегантные серьги ручной работы из серебра 925 пробы с фианитами. Идеально подходят для вечерних мероприятий и особых случаев.',
    material: 'Серебро 925',
    length: '10 см',
    weight: '16 г',
    category: 'earrings',
    collection: 'luna',
    inStock: true
  },
  2: {
    id: 1,
    name: 'Кольцо Лунный свет',
    price: 8900,
    images: ['/images/moonlight1.png', '/images/moonlight2.png', '/images/moonlight3.png', '/images/moonlight4.png'],
    description: 'Изящное кольцо с фианитами, которые сверкают как звездная пыль. Комфортно сидит на пальце и подходит для повседневной носки.',
    material: 'Серебро 925',
    size: '17.5',
    weight: '10 г',
    category: 'rings',
    collection: 'luna',
    inStock: true
  },
  3: {
    id: 3,
    name: 'Колье Солнечная энергия',
    price: 25000,
    images: ['/images/колье1.png', '/images/колье2.png', '/images/колье3.png', '/images/колье4.png'],
    description: 'Роскошное колье с подвеской в виде солнца. Украшено фианитами и создает эффект солнечных лучей.',
    material: 'Золото 545',
    length: '45 см',
    weight: '700 г',
    category: 'necklaces',
    collection: 'solaris',
    inStock: true
  },
  4: {
    id: 4,
    name: 'Браслет Северное сияние',
    price: 11200,
    images: ['/images/браслетик1.png', '/images/браслетик2.png', '/images/браслетик3.png'],
    description: 'Стильный браслет с гравировкой узоров северного сияния. Регулируемая длина подходит для любого запястья.',
    material: 'Нефрит (Breeleu)',
    length: '19 см',
    weight: '400 г',
    category: 'bracelets',
    collection: 'polarlights',
    inStock: true
  },
  5: {
    id: 5,
    name: 'Кольцо Венера',
    price: 10590,
    images: ['/images/венера1.jpg', '/images/венера2.jpg'],
    description: 'Лёгкое ажурное кольцо из серебра и натурального сияющего янтаря красивого коньячного цвета.',
    material: 'Серебро 925',
    length: '19 см',
    weight: '400 г',
    category: 'sets',
    collection: 'planet',
    inStock: true
  },
  6: {
    id: 6,
    name: 'Серьги Марс',
    price: 15500,
    images: ['/images/марс1.jpg', '/images/марс2.jpg'],
    description: 'Серебряные серьги с натуральным янтарём с «кусаной» поверхностью.',
    material: 'Серебро 925',
    length: '4 см',
    weight: '6.8 г',
    category: 'bracelets',
    collection: 'planet',
    inStock: true
  },
  7: {
    id: 7,
    name: 'Колье Юпитер',
    price: 11900,
    images: ['/images/юпитер1.jpg', '/images/юпитер2.jpg'],
    description: 'Колье на серебряной цепочке «Юпитер» из натурального тонированного красногоянтаря',
    material: 'Серебро 925',
    length: '20-21 см',
    weight: '2.8 г',
    category: 'bracelets',
    collection: 'planet',
    inStock: true
  },
  8: {
    id: 8,
    name: 'Браслет Сатурн',
    price: 11200,
    images: ['/images/сатурн1.jpeg', '/images/сатурн2.jpeg', '/images/сатурн3.jpeg'],
    description: 'Натуральная бирюза – это минерал, представляющий собой водный фосфат меди и алюминия. Обладает ярко-небесным цветом, который может меняться до голубовато-синего или блеклого зеленого. Поверхность камня обладает слабым восковым отливом.',
    material: 'Серебро 925',
    length: '19 см',
    weight: '4 г',
    category: 'bracelets',
    collection: 'planet',
    inStock: true
  },
  9: {
    id: 9,
    name: 'Браслет Золотое сияние',
    price: 19200,
    images: ['/images/браслетсолар1.jpg', '/images/браслетсолар2.png', '/images/браслетсолар3.png', '/images/браслетсолар4.png'],
    description: 'Браслет «Золотое сияние» — это воплощение роскоши и уверенности. Идеально отполированное золото создаёт гладкую, сияющую поверхность, которая переливается и играет светом при каждом движении руки. Его лаконичный и современный дизайн делает акцент на безупречной форме и благородстве метал',
    material: 'Золото 585',
    length: '10 см',
    weight: '400 г',
    category: 'bracelets',
    collection: 'solaris',
    inStock: true
  },
  10: {
    id: 10,
    name: 'Серьги Белое солнце',
    price: 19200,
    images: ['/images/серёжкисолар1.jpg', '/images/серёжкисолар2.png', '/images/серёжкисолар3.png', '/images/серёжкисолар4.png'],
    description: 'Искусные золотые серьги с драгоценной белой жемчужиной',
    material: 'Золото 585',
    length: '2 см',
    weight: '50 г',
    category: 'bracelets',
    collection: 'solaris',
    inStock: true
  },
};

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart, addToFavorites, removeFromFavorites, isInFavorites } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadProduct = () => {
      setLoading(true);
      setTimeout(() => {
        const productData = allProducts[id] || allProducts[0];
        setProduct(productData);
        if (productData) {
          setIsFavorite(isInFavorites(productData.id));
        }
        setLoading(false);
      }, 500);
    };

    loadProduct();
  }, [id, isInFavorites]);

  const handleAddToFavorites = () => {
    if (product) {
      if (isFavorite) {
        removeFromFavorites(product.id);
        setIsFavorite(false);
      } else {
        const added = addToFavorites(product);
        if (added) {
          setIsFavorite(true);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-3 mb-6">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
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

  const getCollectionName = (collection) => {
    const collections = {
      luna: 'LUNA',
      solaris: 'SOLARIS',
      polarlights: 'POLAR LIGHTS',
      planet: 'PLANET'
    };
    return collections[collection] || collection;
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
    const categories = {
      rings: 'Кольца',
      earrings: 'Серьги',
      necklaces: 'Колье',
      bracelets: 'Браслеты',
      sets: 'Комплекты',
      brooches: 'Броши'
    };
    return categories[category] || category;
  };

  // Функция для получения значения фильтра категории (англ. ключ)
  const getCategoryParam = (category) => {
    const categoryMap = {
      'Кольца': 'rings',
      'Серьги': 'earrings',
      'Колье': 'necklaces',
      'Браслеты': 'bracelets',
      'Комплекты': 'sets',
      'Броши': 'brooches'
    };
    return categoryMap[getCategoryName(category)] || category;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-gold-600">Главная</Link>
        <span className="mx-2">›</span>
        <Link to="/catalog" className="hover:text-gold-600">Каталог</Link>
        <span className="mx-2">›</span>
        <Link to={`/collections/${product.collection}`} className="hover:text-gold-600 capitalize">
          {getCollectionName(product.collection)}
        </Link>
        <span className="mx-2">›</span>
        {/* КЛИКАБЕЛЬНАЯ КАТЕГОРИЯ - ссылка на каталог с фильтром */}
        <Link 
          to={`/catalog?category=${getCategoryParam(product.category)}`}
          className="hover:text-gold-600 capitalize"
        >
          {getCategoryName(product.category)}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </nav>

      {/* Остальная часть компонента без изменений */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Изображения */}
        <div>
          <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
            <img 
              src={product.images[selectedImage]} 
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`border-2 rounded-lg overflow-hidden transition-all ${
                  selectedImage === index 
                    ? 'border-gold-600 shadow-md' 
                    : 'border-gray-200 hover:border-gold-400'
                }`}
              >
                <img 
                  src={image} 
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Информация о товаре */}
        <div>
          <div className="mb-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCollectionBadgeStyle(product.collection)}`}>
              Коллекция {getCollectionName(product.collection)}
            </span>
          </div>
          
          <h1 className="text-3xl font-serif font-bold mb-4 text-gray-800">{product.name}</h1>
          <p className="text-2xl text-gold-600 font-bold mb-6">{product.price.toLocaleString()} ₽</p>

          {/* Характеристики */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <span className="w-6 text-gold-600">●</span>
              <span className="ml-2">Материал: <strong>{product.material}</strong></span>
            </div>
            {product.length && (
              <div className="flex items-center">
                <span className="w-6 text-gold-600">●</span>
                <span className="ml-2">Длина: <strong>{product.length}</strong></span>
              </div>
            )}
            {product.size && (
              <div className="flex items-center">
                <span className="w-6 text-gold-600">●</span>
                <span className="ml-2">Размер: <strong>{product.size}</strong></span>
              </div>
            )}
            {product.weight && (
              <div className="flex items-center">
                <span className="w-6 text-gold-600">●</span>
                <span className="ml-2">Вес: <strong>{product.weight}</strong></span>
              </div>
            )}
            <div className="flex items-center">
              <span className="w-6 text-gold-600">●</span>
              <span className="ml-2">
                Наличие: 
                <strong className={product.inStock ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                  {product.inStock ? 'В наличии' : 'Нет в наличии'}
                </strong>
              </span>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="space-y-4 mb-8">
  <button
    onClick={() => {
      if (product) {
        addToCart(product);
      }
    }}
    disabled={!product.inStock}
    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
      product.inStock
        ? 'bg-gold-600 hover:bg-gold-700 text-white shadow-lg hover:shadow-xl'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }`}
  >
    {product.inStock ? 'ДОБАВИТЬ В КОРЗИНУ' : 'НЕТ В НАЛИЧИИ'}
  </button>

  <button
    onClick={handleAddToFavorites}
    className={`w-full border-2 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
      isFavorite
        ? 'border-red-500 text-red-500 hover:bg-red-50'
        : 'border-gold-600 text-gold-600 hover:bg-gold-50'
    }`}
  >
    <img 
      src={isFavorite ? "/images/heartf.png" : "/images/heart.png"} 
      alt={isFavorite ? "В избранном" : "Добавить в избранное"}
      className="w-5 h-5 inline mr-2" 
    />
    {isFavorite ? 'УДАЛИТЬ ИЗ ИЗБРАННОГО' : 'ДОБАВИТЬ В ИЗБРАННОЕ'}
  </button>
</div>

          {/* Описание */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800"><img src="/images/book.png" alt="книга" className="w-5 h-5 inline mr-2" /> </h3>
            <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-800">
              <img src="/images/book.png" alt="книга" className="w-5 h-5 inline mr-2" /> 
              Дополнительная информация
            </h4>
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