from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static

from .views import FeedView, MainFeed

from rubl import settings

urlpatterns = [
    path('', FeedView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)