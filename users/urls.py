from django.urls import path
from .views import (
    UserAPIList, 
    UserDetailView, 
    UserMeView, 
    UserRegisterAPIView,
    UserFollowersListView  # Добавили импорт
)

urlpatterns = [
    path('register/', UserRegisterAPIView.as_view(), name='api_register'),
    path('me/', UserMeView.as_view(), name='api_me'),
    
    path('', UserAPIList.as_view(), name='api_users_list'),
    path('<int:pk>/', UserDetailView.as_view(), name='api_user_detail'),
    
    # Путь для получения подписчиков пользователя
    path('<int:user_id>/followers/', UserFollowersListView.as_view(), name='api_user_followers'),
]