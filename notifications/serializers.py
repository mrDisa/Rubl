from rest_framework import serializers

from notifications.models import Notification
from users.serializers import UserSerializer

class NotificationSerializer(serializers.ModelSerializer):
    # ИСПРАВЛЕНО: В модели поле называется actor, а не author
    actor = UserSerializer(read_only=True)
    
    # ДОБАВЛЕНО: Подтягиваем наше виртуальное поле text из модели
    text = serializers.ReadOnlyField()

    class Meta:
        model = Notification
        # Перечисляем все нужные поля (включая text)
        fields = (
            "id", "user", "actor", "actor_count", "type", 
            "post", "is_read", "created_at", "grouping_key", "text"
        )
        read_only_fields = ("actor", "created_at", "is_read")