import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationsPage = () => {
  const {
    allNotifications,
    loading,
    error,
    fetchAllNotifications,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    clearAllNotifications,
    bulkAction
  } = useNotifications();

  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState('all'); // all, read, unread

  useEffect(() => {
    fetchAllNotifications(currentPage, pageSize, filter);
  }, [currentPage, pageSize, filter]);

  const handleSelectAll = () => {
    if (selectedNotifications.size === allNotifications.results?.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(allNotifications.results?.map(n => n.id) || []));
    }
  };

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleBulkMarkRead = async () => {
    if (selectedNotifications.size > 0) {
      await bulkAction('mark_read', Array.from(selectedNotifications));
      setSelectedNotifications(new Set());
      fetchAllNotifications(currentPage, pageSize, filter);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.size > 0) {
      await bulkAction('delete', Array.from(selectedNotifications));
      setSelectedNotifications(new Set());
      fetchAllNotifications(currentPage, pageSize, filter);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    fetchAllNotifications(currentPage, pageSize, filter);
  };

  const handleMarkAsUnread = async (notificationId) => {
    await markAsUnread(notificationId);
    fetchAllNotifications(currentPage, pageSize, filter);
  };

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
    fetchAllNotifications(currentPage, pageSize, filter);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchAllNotifications(currentPage, pageSize, filter);
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setCurrentPage(1);
    fetchAllNotifications(1, pageSize, filter);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const totalPages = Math.ceil((allNotifications.count || 0) / pageSize);
  const notifications = allNotifications.results || [];

  if (loading && !notifications.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            {allNotifications.count || 0} total notifications
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            size="sm"
            disabled={loading || notifications.length === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button
            onClick={handleClearAll}
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={loading || notifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Filter:</label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page Size */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Show:</label>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(parseInt(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedNotifications.size} selected
            </span>
            <Button
              onClick={handleBulkMarkRead}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark Read
            </Button>
            <Button
              onClick={handleBulkDelete}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            {filter === 'all' ? 'You have no notifications yet.' : `No ${filter} notifications found.`}
          </p>
        </div>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">
            <Checkbox
              checked={selectedNotifications.size === notifications.length && notifications.length > 0}
              onCheckedChange={handleSelectAll}
              aria-label="Select all notifications"
            />
            <span className="text-sm font-medium">
              {selectedNotifications.size === notifications.length && notifications.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </span>
          </div>

          {/* Notifications */}
          <div className="divide-y divide-border border border-border rounded-lg">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-accent/50 transition-colors ${
                  !notification.is_read ? 'bg-accent/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedNotifications.has(notification.id)}
                    onCheckedChange={() => handleSelectNotification(notification.id)}
                    aria-label={`Select notification: ${notification.subject}`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                      )}
                      <h3 className="font-medium text-foreground truncate">
                        {notification.subject}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        notification.is_read
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {notification.is_read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {notification.text}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                      {notification.sender && (
                        <p className="text-xs text-muted-foreground">
                          from {notification.sender.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Individual Actions */}
                  <div className="flex items-center gap-1">
                    {notification.is_read ? (
                      <Button
                        onClick={() => handleMarkAsUnread(notification.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label="Mark as unread"
                        disabled={loading}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleMarkAsRead(notification.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label="Mark as read"
                        disabled={loading}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleDeleteNotification(notification.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      aria-label="Delete notification"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, allNotifications.count)} of {allNotifications.count} notifications
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        disabled={loading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;