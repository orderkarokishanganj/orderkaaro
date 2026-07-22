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

function AppContent() {
  const location = useLocation();
  const isCataloguePage = location.pathname === '/' || location.pathname === '/catalogue';

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      {!isCataloguePage && <Header />}
      <Routes>
        <Route path="/" element={<CataloguePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiePage />} />
      </Routes>
      {!isCataloguePage && <Footer />}
      {!isCataloguePage && <ScrollToTopButton />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage  />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiePage />} />
        </Routes>
        <Footer />
        <ScrollToTopButton />
      </div>
    </BrowserRouter>
  );
}

export default App;