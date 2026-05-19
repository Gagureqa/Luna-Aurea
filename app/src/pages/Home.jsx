import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const featuredProducts = [
    { id: 2, name: "Кольцо Лунный свет", price: 8900, image: "/images/moonlight1.png", category: "rings" },
    { id: 1, name: "Серьги Лунное сияние", price: 12500, image: "/images/луна 1.png", category: "earrings" },
    { id: 3, name: "Колье Солнечная энергия", price: 25000, image: "/images/колье1.png", category: "necklaces" },
    { id: 4, name: "Браслет Северное сияние", price: 11200, image: "/images/браслетик1.png", category: "bracelets" },
    { id: 5, name: "Кольцо Венера", price: 10590, image: "/images/венера1.jpg", category: "rings" },
    { id: 6, name: "Серьги Марс", price: 15500, image: "/images/марс1.jpg", category: "earrings" },
    { id: 7, name: "Колье Юпитер", price: 11900, image: "/images/юпитер1.jpg", category: "necklaces" },
    { id: 8, name: "Браслет Сатурн", price: 13400, image: "/images/сатурн1.jpeg", category: "bracelets" }
  ];

  const solarisCollection = [
    { id: 5, name: "SOLARIS Кольцо", price: 10590, image: "/images/венера1.jpg" },
    { id: 9, name: "SOLARIS Браслет", price: 19200, image: "/images/браслетсолар1.jpg" },
    { id: 10, name: "SOLARIS Серьги", price: 19200, image: "/images/серёжкисолар1.jpg" },
    { id: 3, name: "SOLARIS Подвеска", price: 17800, image: "/images/колье1.png" }
  ];

  const goToAbout = () => {
    window.location.href = './About';
  };
  return (
    <div>
      {/* Hero Section with Logo Background */}
      <section className="relative h-96 flex items-center justify-center">
        <img 
          src="./images/logo.png" 
          alt="LUNA AUREA" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            LUNA AUREA
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Наш магазин предлагает множество ювелирных товаров
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative h-80 rounded-lg overflow-hidden">
            <img 
              src="/images/мастерская.jpg" 
              alt="Мастерская" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
              <div className="text-white p-8 max-w-2xl">
                <h2 className="text-3xl font-serif font-bold mb-4">
                  ИСТОРИЯ В КАЖДОЙ ДЕТАЛИ
                </h2>
                <p className="text-lg mb-6">
                  Коротко о философии бренда... Каждое украшение создается с любовью 
                  и вниманием к деталям, отражая уникальность и индивидуальность владельца.
                </p>
                <button 
                onClick={goToAbout}
                className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-3 rounded">
                  УЗНАТЬ БОЛЬШЕ
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Your Style Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">
            НАЙДИТЕ СВОЙ СТИЛЬ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
  {featuredProducts.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden group-hover:shadow-lg transition-shadow">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-gold-600 font-bold">{product.price.toLocaleString()} ₽</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Solaris Collection */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-4">
            ХИТ СЕЗОНА: КОЛЛЕКЦИЯ "SOLARIS"
          </h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
  {solarisCollection.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden group-hover:shadow-lg transition-shadow">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-gold-600 font-bold">{product.price.toLocaleString()} ₽</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Inspiration */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">
            ВДОХНОВЛЯЙТЕСЬ С НАМИ В НАШИХ СОЦ СЕТЯХ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
  {[1, 2, 3, 4].map((num) => (
              <img 
                key={num}
                src={`/images/social${num}.jpg`}
                alt={`Social inspiration ${num}`}
                className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open('/about', '_blank')}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;