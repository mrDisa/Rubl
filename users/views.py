from django.shortcuts import render
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.viewsets import ReadOnlyModelViewSet

from users.serializers import UserSerializer
from users.models import User
from interactions.models import Follow  # Импортируем модель подписок
from interactions.permissions import IsOwnerOrReadOnly

class UserRegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserAPIList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ["^username"]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

class UserMeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# === НОВАЯ ВЬЮХА ДЛЯ ПОДПИСЧИКОВ ===
class UserFollowersListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        # Получаем список ID тех, кто подписан на данного пользователя
        follower_ids = Follow.objects.filter(following_id=user_id).values_list('follower_id', flat=True)
        # Возвращаем QuerySet пользователей
        return User.objects.filter(id__in=follower_ids)