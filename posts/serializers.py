from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Comment, Like, Post


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ("__all__")
        read_only_fields = ("author",)  


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'media', 'created_at', 'updated_at', 'author', 'comments', 'is_liked', 'likes_count', 'comments_count']
        read_only_fields = ("author",)
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    def get_is_liked(self, obj):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()

        return False
    def get_comments_count(self, obj):
        return obj.comments.count()
class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Like
        fields = ['user', 'post']