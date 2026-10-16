import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminAuthProvider } from './auth';
import LoginPage from './LoginPage';
import ResetPasswordPage from './ResetPasswordPage';
import { ToastProvider } from './ui';

const DashboardPage = lazy(() => import('./DashboardPage'));
const OrdersPage = lazy(() => import('./OrdersPage'));
const OrderDetailPage = lazy(() => import('./OrderDetailPage'));
const PackingSlipPage = lazy(() => import('./PackingSlipPage'));
const ProductsPage = lazy(() => import('./ProductsPage'));
const ProductFormPage = lazy(() => import('./ProductFormPage'));
const ImportPage = lazy(() => import('./ImportPage'));
const CategoriesPage = lazy(() => import('./CategoriesPage'));
const MorePage = lazy(() => import('./MorePage'));
const CustomersPage = lazy(() => import('./CustomersPage'));
const CouponsPage = lazy(() => import('./CouponsPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));
const AdminsPage = lazy(() => import('./AdminsPage'));
const ActivityPage = lazy(() => import('./ActivityPage'));

/** Everything under /admin. Loaded only when someone opens /admin, so customers never download it. */
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="orders/:id/slip" element={<PackingSlipPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/import" element={<ImportPage />} />
            <Route path="products/:id" element={<ProductFormPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="more" element={<MorePage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AdminAuthProvider>
  );
}
