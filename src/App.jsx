import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useSelector } from 'react-redux';
import { NotificationProvider } from './pages/customer/NotificationContext';
import AuthPage from './pages/auth/AuthPage';
import RestaurantsPage from './pages/customer/RestaurantsPage';
import RestaurantDetailPage from './pages/customer/RestaurantDetailPage';
import CartPage from './pages/customer/CartPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import FavoritesPage from './pages/customer/FavoritesPage';
import ProfilePage from './pages/customer/ProfilePage';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantOrders from './pages/restaurant/RestaurantOrders';
import RestaurantMenu from './pages/restaurant/RestaurantMenu';
import RestaurantReviews from './pages/restaurant/RestaurantReviews';
import LoginSuccessPage from './pages/auth/LoginSuccess';
import CreateRestaurant from './pages/restaurant/CreateRestaurant';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (user?.role === 'restaurant_owner') {
      return <Navigate to="/restaurant/dashboard" replace />;
    }
    return <Navigate to="/restaurants" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <PublicRoute> <AuthPage /> </PublicRoute> }/>
        <Route path="/login-success" element={<LoginSuccessPage />} />
        <Route path="/forgot-password" element={ <PublicRoute> <ForgotPasswordPage /> </PublicRoute> }/>
        <Route path="/reset-password/:resettoken" element={ <PublicRoute> <ResetPasswordPage /> </PublicRoute> }/>
        <Route path="/restaurants" element={ <ProtectedRoute allowedRoles={['customer']}> <RestaurantsPage /> </ProtectedRoute> }/>
        <Route path="/restaurant/:id" element={ <ProtectedRoute allowedRoles={['customer']}> <RestaurantDetailPage /> </ProtectedRoute>}/>
        <Route path="/cart" element={ <ProtectedRoute allowedRoles={['customer']}> <CartPage /> </ProtectedRoute> } />
        <Route path="/orders" element={ <ProtectedRoute allowedRoles={['customer']}> <OrdersPage /> </ProtectedRoute> }/>
        <Route path="/orders/:id/track" element={ <ProtectedRoute allowedRoles={['customer']}> <OrderTrackingPage /> </ProtectedRoute>}/>
        <Route path="/favorites" element={ <ProtectedRoute allowedRoles={['customer']}> <FavoritesPage /> </ProtectedRoute>}/>
        <Route path="/profile" element={ <ProtectedRoute allowedRoles={['customer']}> <ProfilePage /> </ProtectedRoute> }/>
        <Route path="/restaurant/dashboard" element={ <ProtectedRoute allowedRoles={['restaurant_owner']}> <RestaurantDashboard /> </ProtectedRoute> }/>
        <Route path="/restaurant/orders" element={ <ProtectedRoute allowedRoles={['restaurant_owner']}> <RestaurantOrders /> </ProtectedRoute> }/>
        <Route path="/restaurant/menu" element={ <ProtectedRoute allowedRoles={['restaurant_owner']}> <RestaurantMenu /> </ProtectedRoute> }/>
        <Route path="/restaurant/create" element={ <ProtectedRoute allowedRoles={['restaurant_owner']}> <CreateRestaurant /> </ProtectedRoute> }/>
        <Route path="/restaurant/reviews" element={ <ProtectedRoute allowedRoles={['restaurant_owner']}> <RestaurantReviews /> </ProtectedRoute> }/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </Provider>
  );
}

export default App;