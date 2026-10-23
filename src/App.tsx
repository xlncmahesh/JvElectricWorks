import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { RequireAuth } from '@/components/auth/RequireAuth';
import AuthPage from '@/pages/AuthPage';
import HomePage from '@/pages/HomePage';
import CablesPage from '@/pages/info/CablesPage';
import LightsPage from '@/pages/info/LightsPage';
import MobilesPage from '@/pages/info/MobilesPage';
import SolarPage from '@/pages/info/SolarPage';
import BuyHomePage from '@/pages/buy/BuyHomePage';
import CataloguePage from '@/pages/buy/CataloguePage';
import ProductDetailPage from '@/pages/buy/ProductDetailPage';
import CheckoutPage from '@/pages/CheckoutPage';
import CartPage from '@/pages/CartPage';
import ServicesPage from '@/pages/ServicesPage';
import RepairFormPage from '@/pages/services/RepairFormPage';
import SolarInstallationFormPage from '@/pages/services/SolarInstallationFormPage';
import AboutPage from '@/pages/AboutPage';
import SettingsPage from '@/pages/SettingsPage';
import OrderHistoryPage from '@/pages/account/OrderHistoryPage';
import OrderDetailPage from '@/pages/account/OrderDetailPage';
import SupportPage from '@/pages/account/SupportPage';
import NewSupportTicketPage from '@/pages/account/NewSupportTicketPage';
import SupportTicketDetailPage from '@/pages/account/SupportTicketDetailPage';
import ServiceRequestsPage from '@/pages/account/ServiceRequestsPage';
import ServiceRequestDetailPage from '@/pages/account/ServiceRequestDetailPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        <Routes>
          {/* Auth page stands alone (no site header/footer) */}
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cables" element={<CablesPage />} />
            <Route path="/lights" element={<LightsPage />} />
            <Route path="/mobiles" element={<MobilesPage />} />
            <Route path="/solar" element={<SolarPage />} />
            <Route path="/buy" element={<BuyHomePage />} />
            <Route path="/buy/:category" element={<CataloguePage />} />
            <Route path="/buy/:category/product/:slug" element={<ProductDetailPage />} />
            <Route path="/buy/:category/:subcategory" element={<CataloguePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route
              path="/settings"
              element={
                <RequireAuth intent="Sign in to view your settings">
                  <SettingsPage />
                </RequireAuth>
              }
            />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/checkout"
              element={
                <RequireAuth intent="Sign in to submit your order">
                  <CheckoutPage />
                </RequireAuth>
              }
            />
            <Route
              path="/services/repair/form"
              element={
                <RequireAuth intent="Sign in to request a repair">
                  <RepairFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/services/solarinstallation/form"
              element={
                <RequireAuth intent="Sign in to request a solar consultation">
                  <SolarInstallationFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth intent="Sign in to view your orders">
                  <OrderHistoryPage />
                </RequireAuth>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <RequireAuth intent="Sign in to view your order">
                  <OrderDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/support"
              element={
                <RequireAuth intent="Sign in to view your support tickets">
                  <SupportPage />
                </RequireAuth>
              }
            />
            <Route
              path="/support/new"
              element={
                <RequireAuth intent="Sign in to create a support ticket">
                  <NewSupportTicketPage />
                </RequireAuth>
              }
            />
            <Route
              path="/support/:id"
              element={
                <RequireAuth intent="Sign in to view this ticket">
                  <SupportTicketDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/requests"
              element={
                <RequireAuth intent="Sign in to view your service requests">
                  <ServiceRequestsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/requests/:id"
              element={
                <RequireAuth intent="Sign in to view this request">
                  <ServiceRequestDetailPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
