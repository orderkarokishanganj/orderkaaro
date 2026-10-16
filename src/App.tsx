import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CatalogProvider } from './data/CatalogContext';
import { LanguageProvider } from './i18n/LanguageContext';
import CartPage from './pages/CartPage';
import CategoryPage from './pages/CategoryPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { Layout } from './ui/Layout';

// Pages customers rarely open first are loaded only when visited.
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CookiePage = lazy(() => import('./pages/CookiePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <CatalogProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="product/:slug" element={<ProductPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order/:ref" element={<OrderConfirmationPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="cookies" element={<CookiePage />} />
                <Route path="review" element={<ReviewPage />} />
                {/* Old addresses from the previous site */}
                <Route path="home" element={<Navigate to="/" replace />} />
                <Route path="catalogue" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CatalogProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
