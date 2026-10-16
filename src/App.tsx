 import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CataloguePage from './pages/CataloguePage';
import PrivacyPage from './pages/PrivacyPage';
import CookiePage from './pages/CookiePage';
import ReviewPage from './pages/ReviewPage';

function AppContent() {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/' || location.pathname === '/catalogue' || location.pathname === '/review';

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      {!isFullScreenPage && <Header />}
      <Routes>
        <Route path="/" element={<CataloguePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiePage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
      {!isFullScreenPage && <Footer />}
      {!isFullScreenPage && <ScrollToTopButton />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;