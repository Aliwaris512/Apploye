import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import NotificationBadge from '../NotificationBadge';
import { store } from '../../store';
import { addNotification } from '../../features/notifications/notificationsSlice';

describe('NotificationBadge', () => {
  beforeEach(() => {
    // Clear the store before each test
    store.dispatch({ type: 'RESET' });
  });

  it('renders without notifications', () => {
    render(<NotificationBadge />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });

  it('shows badge when there are unread notifications', () => {
    // Add a notification to the store
    store.dispatch(
      addNotification({
        id: '1',
        title: 'Test Notification',
        message: 'This is a test',
        read: false,
        timestamp: new Date().toISOString(),
      })
    );

    render(<NotificationBadge />);
    expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens notification panel when clicked', async () => {
    // Add some notifications
    store.dispatch(
      addNotification({
        id: '1',
        title: 'Unread Notification',
        message: 'Unread message',
        read: false,
        timestamp: new Date().toISOString(),
      })
    );
    store.dispatch(
      addNotification({
        id: '2',
        title: 'Read Notification',
        message: 'Read message',
        read: true,
        timestamp: new Date().toISOString(),
      })
    );

    render(<NotificationBadge />);
    
    // Click the notification button
    fireEvent.click(screen.getByRole('button'));
    
    // Check if the panel is open
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Unread Notification')).toBeInTheDocument();
    expect(screen.getByText('Read Notification')).toBeInTheDocument();
  });

  it('marks notification as read when clicked', async () => {
    // Mock the markAsRead function
    const mockMarkAsRead = jest.fn();
    
    // Add a notification
    store.dispatch(
      addNotification({
        id: '1',
        title: 'Test Notification',
        message: 'Test message',
        read: false,
        timestamp: new Date().toISOString(),
      })
    );

    render(<NotificationBadge onMarkAsRead={mockMarkAsRead} />);
    
    // Open the notification panel
    fireEvent.click(screen.getByRole('button'));
    
    // Find and click the mark as read button
    const markAsReadButton = screen.getByLabelText('Mark as read');
    fireEvent.click(markAsReadButton);
    
    // Check if the markAsRead function was called
    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('shows empty state when there are no notifications', async () => {
    render(<NotificationBadge />);
    
    // Open the notification panel
    fireEvent.click(screen.getByRole('button'));
    
    // Check if the empty state is shown
    expect(screen.getByText('No notifications to display')).toBeInTheDocument();
  });
});
