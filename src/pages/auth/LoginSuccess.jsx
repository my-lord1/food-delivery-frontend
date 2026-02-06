import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const LoginSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      const tokenFromURL = searchParams.get('token');

      if (!tokenFromURL) {
        console.error('No token found in URL');
        navigate('/');
        return;
      }

      try {
        localStorage.setItem('token', tokenFromURL);
        const response = await api.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${tokenFromURL}`
          }
        });

        dispatch(loginSuccess({
          token: tokenFromURL,
          user: response.data.data
        }));

        if (response.data.data.role === 'restaurant_owner') {
          navigate('/restaurant/dashboard');
        } else {
          navigate('/restaurants');
        }
      } catch (error) {
        console.error('Error during Google login:', error);
        localStorage.removeItem('token');
        navigate('/');
      }
    };

    handleGoogleLogin();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Completing login...</p>
      </div>
    </div>
  );
};

export default LoginSuccessPage;