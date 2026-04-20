from django.urls import path
from django.views.generic import TemplateView

from .views import UserAPIList, UserDetailView, UserMeView, UserRegisterAPIView

urlpatterns = [
    path('signup/', TemplateView.as_view(template_name='users/register.html'), name='signup_page'),
    path('register/', UserRegisterAPIView.as_view(), name='api_register'),
    path('', UserAPIList.as_view()),
    path('<int:pk>/', UserDetailView.as_view()),
    path('me/', UserMeView.as_view()),
]