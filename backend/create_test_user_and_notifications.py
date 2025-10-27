#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from generic_notifications.models import Notification, NotificationChannel
from generic_notifications.channels import WebsiteChannel

User = get_user_model()

def main():
    print("Creating test user and sending notifications...")
    
    # Create a test user
    test_user, created = User.objects.get_or_create(
        email='testuser@example.com',
        defaults={'first_name': 'Test', 'last_name': 'User'}
    )
    if created:
        test_user.set_password('testpassword123')
        test_user.save()
        print(f'✓ Created new test user: {test_user.email}')
    else:
        print(f'✓ Test user already exists: {test_user.email}')

    # Get the existing user
    try:
        existing_user = User.objects.get(email='eluriabhinav@gmail.com')
        print(f'✓ Found existing user: {existing_user.email}')
    except User.DoesNotExist:
        print('✗ Existing user not found. Creating it...')
        existing_user = User.objects.create_user(
            email='eluriabhinav@gmail.com',
            password='password123',
            first_name='Abhinav',
            last_name='Eluri'
        )
        print(f'✓ Created existing user: {existing_user.email}')

    # Send notifications to existing user
    print(f"\nSending notifications to {existing_user.email}...")
    for i in range(3):
        notification = Notification.objects.create(
            recipient=existing_user,
            subject=f'Test Notification {i+1} for Existing User',
            text=f'This is test notification number {i+1} sent to the existing user {existing_user.email}. This notification contains important information about your account.',
            notification_type='general',
            url='/dashboard'
        )
        
        # Add to WebsiteChannel
        NotificationChannel.objects.create(
            notification=notification,
            channel=WebsiteChannel.key
        )
        
        print(f'  ✓ Sent notification {i+1} to {existing_user.email}')

    # Send notifications to test user
    print(f"\nSending notifications to {test_user.email}...")
    for i in range(3):
        notification = Notification.objects.create(
            recipient=test_user,
            subject=f'Test Notification {i+1} for Test User',
            text=f'This is test notification number {i+1} sent to the test user {test_user.email}. Welcome to the platform!',
            notification_type='general',
            url='/dashboard'
        )
        
        # Add to WebsiteChannel
        NotificationChannel.objects.create(
            notification=notification,
            channel=WebsiteChannel.key
        )
        
        print(f'  ✓ Sent notification {i+1} to {test_user.email}')

    # Summary
    print('\n' + '='*50)
    print('NOTIFICATION SUMMARY:')
    print('='*50)
    existing_count = Notification.objects.for_channel(WebsiteChannel).filter(recipient=existing_user).count()
    test_count = Notification.objects.for_channel(WebsiteChannel).filter(recipient=test_user).count()
    existing_unread = Notification.objects.for_channel(WebsiteChannel).filter(recipient=existing_user, read__isnull=True).count()
    test_unread = Notification.objects.for_channel(WebsiteChannel).filter(recipient=test_user, read__isnull=True).count()
    
    print(f'📧 {existing_user.email}:')
    print(f'   Total notifications: {existing_count}')
    print(f'   Unread notifications: {existing_unread}')
    
    print(f'📧 {test_user.email}:')
    print(f'   Total notifications: {test_count}')
    print(f'   Unread notifications: {test_unread}')
    
    print('\n✅ All notifications sent successfully!')

if __name__ == '__main__':
    main()