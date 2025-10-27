#!/usr/bin/env python
"""
Script to create sample notifications for testing the notification system.
Run this script with: python create_sample_notifications.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from generic_notifications.models import Notification, NotificationChannel
from generic_notifications.channels import WebsiteChannel
from datetime import datetime, timedelta
import random

User = get_user_model()

# Get or create a test user
user, created = User.objects.get_or_create(
    email='test@example.com',
    defaults={
        'first_name': 'Test',
        'last_name': 'User',
        'is_active': True
    }
)

if created:
    user.set_password('testpassword123')
    user.save()
    print(f"Created test user: {user.email}")
else:
    print(f"Using existing test user: {user.email}")

# Sample notification data
sample_notifications = [
    {
        'subject': 'Welcome to the platform!',
        'text': 'Thank you for joining our platform. We\'re excited to have you on board!',
        'url': '/welcome',
        'is_read': False
    },
    {
        'subject': 'New message received',
        'text': 'You have received a new message from John Doe.',
        'url': '/messages/123',
        'is_read': False
    },
    {
        'subject': 'Profile updated successfully',
        'text': 'Your profile information has been updated successfully.',
        'url': '/profile',
        'is_read': True
    },
    {
        'subject': 'Security alert',
        'text': 'A new device has been used to access your account.',
        'url': '/security',
        'is_read': False
    },
    {
        'subject': 'Weekly digest',
        'text': 'Here\'s your weekly activity summary.',
        'url': '/digest',
        'is_read': True
    },
    {
        'subject': 'Payment processed',
        'text': 'Your payment of $29.99 has been processed successfully.',
        'url': '/billing',
        'is_read': False
    },
    {
        'subject': 'System maintenance scheduled',
        'text': 'Scheduled maintenance will occur on Sunday at 2 AM UTC.',
        'url': '/maintenance',
        'is_read': True
    },
    {
        'subject': 'New feature available',
        'text': 'Check out our new dashboard feature!',
        'url': '/features',
        'is_read': False
    },
    {
        'subject': 'Account verification required',
        'text': 'Please verify your account to continue using all features.',
        'url': '/verify',
        'is_read': False
    },
    {
        'subject': 'Backup completed',
        'text': 'Your data backup has been completed successfully.',
        'url': '/backup',
        'is_read': True
    }
]

# Clear existing notifications for the test user
Notification.objects.filter(recipient=user).delete()
print("Cleared existing notifications")

# Create sample notifications
created_count = 0
for i, notification_data in enumerate(sample_notifications):
    # Create notification with some being read and some unread
    is_read = random.choice([True, False])
    
    # Create the notification
    notification = Notification.objects.create(
        recipient=user,
        subject=notification_data['subject'],
        text=notification_data['text'],
        notification_type='general',  # Use a default notification type
        url=notification_data['url'],
        added=datetime.now() - timedelta(days=random.randint(0, 7))
    )
    
    # Mark as read if needed (using the read field which is a datetime)
    if is_read:
        notification.mark_as_read()
    
    # Add to WebsiteChannel
    NotificationChannel.objects.create(
        notification=notification,
        channel=WebsiteChannel.key
    )
    
    print(f"Created notification {i+1}: {notification_data['subject']} ({'read' if is_read else 'unread'})")
    created_count += 1

print(f"\nSuccessfully created {len(sample_notifications)} sample notifications!")

# Print summary
total_notifications = Notification.objects.filter(recipient=user).count()
unread_notifications = Notification.objects.filter(recipient=user, read__isnull=True).count()
read_notifications = Notification.objects.filter(recipient=user, read__isnull=False).count()

print(f"\nNotification Summary:")
print(f"Total notifications: {total_notifications}")
print(f"Unread notifications: {unread_notifications}")
print(f"Read notifications: {read_notifications}")

print(f"\nTest user credentials:")
print(f"Email: {user.email}")
print(f"Password: testpassword123")