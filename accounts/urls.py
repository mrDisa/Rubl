from django.urls import path
from . import views

urlpatterns = [
    path('', views.register, name='register'),
    path('reg/', views.reg, name='reg'),
]