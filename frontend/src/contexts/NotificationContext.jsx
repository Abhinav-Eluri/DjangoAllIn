import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState({ results: [], count: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await api.get('/notifications/unread_count/');
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isLoggedIn]);

  // Fetch unread notifications
  const fetchUnreadNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const response = await api.get('/notifications/unread/');
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Fetch all notifications with pagination
  const fetchAllNotifications = async (page = 1, pageSize = 10, filter = 'all') => {
    try {
      setLoading(true);
      let url = `/notifications/?page=${page}&page_size=${pageSize}`;
      if (filter !== 'all') {
        url += `&filter=${filter}`;
      }
      const response = await api.get(url);
      setAllNotifications(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      // Update allNotifications as well
      setAllNotifications(prev => ({
        ...prev,
        results: prev.results.map(n => ({ ...n, is_read: true }))
      }));
    } catch (err) {
      setError('Failed to mark notifications as read');
      console.error('Error marking notifications as read:', err);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await api.post('/notifications/clear_all/');
      setNotifications([]);
      setAllNotifications({ results: [], count: 0 });
      setUnreadCount(0);
    } catch (err) {
      setError('Failed to clear notifications');
      console.error('Error clearing notifications:', err);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/mark_read/`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      // Update allNotifications as well
      setAllNotifications(prev => ({
        ...prev,
        results: prev.results.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      }));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark single notification as unread
  const markAsUnread = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/mark_unread/`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: false } : n)
      );
      // Update allNotifications as well
      setAllNotifications(prev => ({
        ...prev,
        results: prev.results.map(n => n.id === notificationId ? { ...n, is_read: false } : n)
      }));
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      setError('Failed to mark notification as unread');
      console.error('Error marking notification as unread:', err);
    }
  };

  // Delete single notification
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}/`);
      const notification = notifications.find(n => n.id === notificationId);
      const allNotification = allNotifications.results.find(n => n.id === notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setAllNotifications(prev => ({
        ...prev,
        results: prev.results.filter(n => n.id !== notificationId),
        count: Math.max(0, prev.count - 1)
      }));
      
      if ((notification && !notification.is_read) || (allNotification && !allNotification.is_read)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError('Failed to delete notification');
      console.error('Error deleting notification:', err);
    }
  };

  // Bulk actions
  const bulkAction = async (action, notificationIds) => {
    try {
      await api.post('/notifications/bulk_actions/', {
        action,
        notification_ids: notificationIds
      });
      
      if (action === 'mark_read') {
        setNotifications(prev => 
          prev.map(n => notificationIds.includes(n.id) ? { ...n, is_read: true } : n)
        );
        const unreadToRead = notifications.filter(n => 
          notificationIds.includes(n.id) && !n.is_read
        ).length;
        setUnreadCount(prev => Math.max(0, prev - unreadToRead));
      } else if (action === 'mark_unread') {
        setNotifications(prev => 
          prev.map(n => notificationIds.includes(n.id) ? { ...n, is_read: false } : n)
        );
        const readToUnread = notifications.filter(n => 
          notificationIds.includes(n.id) && n.is_read
        ).length;
        setUnreadCount(prev => prev + readToUnread);
      } else if (action === 'delete') {
        const deletedUnread = notifications.filter(n => 
          notificationIds.includes(n.id) && !n.is_read
        ).length;
        setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
        setUnreadCount(prev => Math.max(0, prev - deletedUnread));
      }
    } catch (err) {
      setError('Failed to perform bulk action');
      console.error('Error performing bulk action:', err);
    }
  };

  // Initialize notifications on mount
  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadNotifications();
  }, [fetchUnreadCount, fetchUnreadNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchUnreadNotifications, isLoggedIn]);

  const value = {
    notifications,
    allNotifications,
    unreadCount,
    loading,
    error,
    fetchUnreadNotifications,
    fetchAllNotifications,
    markAllAsRead,
    clearAllNotifications,
    markAsRead,
    markAsUnread,
    deleteNotification,
    bulkAction,
    refreshUnreadCount: fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};