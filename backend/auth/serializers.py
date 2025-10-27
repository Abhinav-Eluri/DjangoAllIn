from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomRegisterSerializer(RegisterSerializer):
    """
    Custom registration serializer that removes username requirement
    and uses email as the primary identifier
    """
    username = None  # Remove username field completely
    first_name = serializers.CharField(required=True, max_length=30)
    last_name = serializers.CharField(required=True, max_length=30)
    
    def get_cleaned_data(self):
        return {
            'email': self.validated_data.get('email', ''),
            'password1': self.validated_data.get('password1', ''),
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
        }

    def save(self, request):
        """
        Override save method to create user with email as username
        """
        from allauth.account.utils import setup_user_email
        from allauth.account import app_settings
        
        user = User()
        user.email = self.get_cleaned_data()['email']
        user.first_name = self.get_cleaned_data()['first_name']
        user.last_name = self.get_cleaned_data()['last_name']
        
        # Set email as username since we disabled username field
        user.username = user.email
        
        password = self.get_cleaned_data()['password1']
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
            
        user.save()
        setup_user_email(request, user, [])
        return user