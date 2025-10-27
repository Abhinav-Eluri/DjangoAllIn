from django.urls import path
from .views import CustomRegisterView

urlpatterns = [
    path('registration/', CustomRegisterView.as_view(), name='custom_register'),
]