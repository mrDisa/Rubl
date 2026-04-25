from django.urls import path

# Импортируем ВСЕ вьюхи, включая новые для лайков и комментов
from .views import (
    CommentDetailView, CommentListCreateView, 
    MyPostsDetailView, MyPostsView, 
    PostDetailView, PostListCreateView,
    ToggleLikeView, UserPostsListView,
    CommentLikeToggleView, PostCommentsView 
)

urlpatterns = [
    # ==========================================
    # ПОСТЫ
    # ==========================================
    path('posts/', PostListCreateView.as_view(), name='post-list'),
    path('posts/my/', MyPostsView.as_view(), name='my-posts'),
    path('posts/my/<int:pk>/', MyPostsDetailView.as_view(), name='my-posts-detail'),
    path('posts/user/<int:user_id>/', UserPostsListView.as_view(), name='user-posts'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    
    # Действия с постами
    path('posts/<int:pk>/comments/', PostCommentsView.as_view(), name='post-comments'),
    path('posts/<int:post_id>/like/', ToggleLikeView.as_view(), name='post-like'),

    # ==========================================
    # КОММЕНТАРИИ
    # ==========================================
    path('comments/', CommentListCreateView.as_view(), name='comment-list'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    
    # ТОТ САМЫЙ ЭНДПОИНТ ДЛЯ ЛАЙКОВ (Фикс ошибки 404!)
    path('comments/<int:comment_id>/like/', CommentLikeToggleView.as_view(), name='comment-like'),
]