import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminAuthProvider } from './auth';
import LoginPage from './LoginPage';
import ResetPasswordPage from './ResetPasswordPage';
import { ToastProvider } from './ui';

const ProductsPage = lazy(() => import('./ProductsPage'));
const ProductFormPage = lazy(() => import('./ProductFormPage'));
const ImportPage = lazy(() => import('./ImportPage'));
const CategoriesPage = lazy(() => import('./CategoriesPage'));

/** Everything under /admin. Loaded only when someone opens /admin, so customers never download it. */
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/import" element={<ImportPage />} />
            <Route path="products/:id" element={<ProductFormPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="*" element={<Navigate to="products" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AdminAuthProvider>
  );
}
