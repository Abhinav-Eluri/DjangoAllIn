from django.shortcuts import render
from dj_rest_auth.registration.views import RegisterView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CustomRegisterSerializer

class CustomRegisterView(RegisterView):
    """
    Custom registration view that returns success message instead of auto-login
    """
    serializer_class = CustomRegisterSerializer
    
    def create(self, request, *args, **kwargs):
        # Call the parent's create method to handle the full registration flow
        # including email verification
        response = super().create(request, *args, **kwargs)
        
        # Get the user email from the serializer data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Return custom success message instead of the default response
        return Response({
            'detail': 'User registered successfully. Please check your email to verify your account.',
            'email': serializer.validated_data['email']
        }, status=status.HTTP_201_CREATED)

# Create your views here.
