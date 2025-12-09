from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('reg/', views.reg, name='reg'),
    path('log/', views.log, name='log'),
]