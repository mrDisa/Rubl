from django.urls import path
from .views import (
    UserAPIList, 
    UserDetailView,
    UserFollowingListView, 
    UserMeView,
    UserPostsListView, 
    UserRegisterAPIView,
    UserFollowersListView  # Добавили импорт
)

urlpatterns = [
    path('register/', UserRegisterAPIView.as_view(), name='api_register'),
    path('me/', UserMeView.as_view(), name='api_me'),
    
    path('', UserAPIList.as_view(), name='api_users_list'),
    path('<int:pk>/', UserDetailView.as_view(), name='api_user_detail'),
    path('<int:pk>/posts/', UserPostsListView.as_view(), name='api_user_posts'),
    path('<int:user_id>/followers/', UserFollowersListView.as_view(), name='api_user_followers'),
    path('<int:pk>/following/', UserFollowingListView.as_view(), name='api_user_followers'),
]