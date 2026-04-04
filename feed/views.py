from django.shortcuts import render
from rest_framework import generics

from main.models import Follow, Post
from main.serializers import FollowSerializer, PostSerializer, UserSerializer

class FeedView(generics.ListAPIView):
    serializer_class = PostSerializer
    def get_queryset(self):
        follow = Follow.objects.filter(follower=self.request.user)
        following_users = follow.values_list('following', flat=True)
        return Post.objects.filter(author__in=following_users).distinct().order_by('-created_at').prefetch_related('comments')