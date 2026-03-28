from rest_framework import serializers

from .models import Follow, Post, User, Comment

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("__all__")
        read_only_fields = ("author",)
        
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
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Comment
        fields = ("__all__")
        read_only_fields = ("author", "post",)  

class FollowSerializer(serializers.ModelSerializer):
    follower = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Follow
        fields = ['follower', 'following', 'created_at']
    