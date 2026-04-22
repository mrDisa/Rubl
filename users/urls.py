from django.urls import path
from .views import UserAPIList, UserDetailView, UserMeView, UserRegisterAPIView

urlpatterns = [
    path('register/', UserRegisterAPIView.as_view(), name='api_register'),
    path('me/', UserMeView.as_view(), name='api_me'),
    
    path('', UserAPIList.as_view(), name='api_users_list'),
    path('<int:pk>/', UserDetailView.as_view(), name='api_user_detail'),
]