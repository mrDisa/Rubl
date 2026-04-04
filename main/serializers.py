from rest_framework import serializers

from .models import Follow, Like, Post, User, Comment
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['firstname', 'username', 'job', 'rank']
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'], email=validated_data['email'], password=validated_data['password']
        )
        return user

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ("__all__")
        read_only_fields = ("author", "post",)  

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'media', 'created_at', 'updated_at', 'author', 'comments']
        read_only_fields = ("author",)


class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    class Meta:
        model = Follow
        fields = ['follower', 'following', 'created_at']

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Like
        fields = ['user', 'post']
    
    