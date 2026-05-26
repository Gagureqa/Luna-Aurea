//app/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductPage from './pages/ProductPage';
import Profile from './pages/Profile';
import AuthPage from './components/AuthPage';
import About from './pages/About';
import Contacts from './pages/Contacts';
import ProductModal from './components/ProductModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import CancelOrderModal from './components/CancelOrderModal';
import Collections from './pages/Collections';
import CollectionDetail from './components/CollectionDetail';

// Компонент защищенного маршрута
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ModalProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <Navbar />
            <ProductModal />
            <OrderSuccessModal />
            <CancelOrderModal /> {/* ✅ Добавляем модальное окно отмены заказа */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:id" element={<CollectionDetail />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route 
              //ProtectedRoute компонент
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/about" element={<About />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ModalProvider>
  );
}

export default App;
