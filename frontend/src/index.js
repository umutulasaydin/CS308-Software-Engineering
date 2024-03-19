import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import LoginPage from './routes/LoginPage';
import './styles.css'
import SignupPage from './routes/SignupPage';
import ShoppingCart from './routes/ShoppingCartPage';
import MainPage from './routes/MainPage';
import App from './App';
import PaymentPage from './routes/PaymentPage';
import OrderSuccessPage from './routes/OrderSuccessPage';
import Profile from './components/Profile'
import ProductPage from './routes/ProductPage';
import OrdersPage from './routes/OrdersPage';
import ProfitLossPage from './routes/ProfitLossPage';
import AdminPanel from './routes/AdminPanel';
import Wishlist from './routes/Wishlist';
import ViewInvoice from './routes/ViewInvoice';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<MainPage />} />
          <Route path="products/:category" element={<MainPage />} />
          <Route path="cart" element={<ShoppingCart />} />
          <Route path="checkout" element={<PaymentPage />} />
          <Route path="success" element={<OrderSuccessPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="product/:productId" element={<ProductPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="profit" element={<ProfitLossPage />} />
          <Route path="wishlist" element={<Wishlist />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/pdfview/:orderNo" element={<ViewInvoice />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

