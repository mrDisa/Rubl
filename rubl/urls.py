from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static

from main import views
from main.views import CommentDetailView, CommentListCreateView, FollowDetailView, FollowListCreateView, LikeDetailView, LikeListCreateView, PostDetailView,  PostListCreateView, UserAPIList, UserDetailView, UserMeView

from . import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.mainView, name='main'),
    # USER URLS

    path('api/v1/users/', UserAPIList.as_view()),
    path('api/v1/users/<int:pk>/', UserDetailView.as_view()),
    path('api/v1/users/me', UserMeView.as_view()),

    # POST URLS

    path('api/v1/posts/', PostListCreateView.as_view()),
    path('api/v1/posts/<int:pk>/', PostDetailView.as_view()),

    # COMMENT URLS
    
    path('api/v1/comments/', CommentListCreateView.as_view()),
    path('api/v1/comments/<int:pk>/', CommentDetailView.as_view()),

    # FOLLOW URLS
    path('api/v1/follows/', FollowListCreateView.as_view()),
    path('api/v1/follows/<int:pk>/', FollowDetailView.as_view()),

    # LIKE URLS
    path('api/v1/likes/', LikeListCreateView.as_view()),
    path('api/v1/likes/<int:pk>/', LikeDetailView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)