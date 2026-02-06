import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import api from '../../services/api';
import { toast } from 'react-hot-toast'; 

import { setNotifications, addNotification, markAsRead as markAsReadAction, setUnreadCount } from '../../redux/slices/notificationSlice';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notification);
  const dispatch = useDispatch();
  
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const newSocket = setupSocket();
      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [user]);

  const setupSocket = () => {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join', user._id);
    });

    newSocket.on('order_status_update', (data) => {
      playNotificationSound();

      const messages = {
        confirmed: '🍽️ Restaurant accepted your order!',
        preparing: '🍳 Food is being prepared.',
        ready: '🥡 Order is ready for pickup!',
        out_for_delivery: '🛵 Order is out for delivery!',
        delivered: '🎉 Order delivered. Enjoy!',
        cancelled: '❌ Order was cancelled.'
      };
      
      toast.success(messages[data.status] || 'Order updated!', {
        duration: 5000,
        position: 'top-right',
        style: {
          border: '1px solid #000',
          padding: '16px',
          color: '#000',
        },
      });

      fetchNotifications();
    });

    newSocket.on('notification', (data) => {
      playNotificationSound();

      toast(data.message || 'New Notification', {
        icon: '🔔',
        duration: 5000,
        position: 'top-right',
        style: {
          border: '1px solid #000',
          padding: '16px',
          color: '#000',
        },
      });
      
      fetchNotifications();
    });

    return newSocket;
  };

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3'); 
    audio.play().catch(e => console.log('Audio error:', e));
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications?limit=20');
      dispatch(setNotifications(response.data.data));
      dispatch(setUnreadCount(response.data.unreadCount));
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      dispatch(markAsReadAction(id));
    } catch (error) {
      console.error('Error marking read', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all read', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};