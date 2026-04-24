from django.db import models

from posts.models import Post
from users.models import User

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        LIKE = "like", "Like"
        FOLLOW = "follow", "Follow"
        COMMENT = "comment", "Comment"
        MENTION = "mention", "Mention"
        NEW_POST = "new_post", "New Post"  # <-- ДОБАВИЛИ НОВЫЙ ТИП

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    actor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_notifications")
    actor_count = models.PositiveIntegerField(default=1)
    type = models.CharField(max_length=20, choices=NotificationType.choices)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    grouping_key = models.CharField(max_length=100, db_index=True, null=True, blank=True)
    
    # <-- ДОБАВИЛИ ГЕНЕРАТОР ТЕКСТА ДЛЯ ФРОНТЕНДА -->
    @property
    def text(self):
        if self.type == self.NotificationType.LIKE:
            return f"@{self.actor.username} оценил(а) ваш пост."
        elif self.type == self.NotificationType.FOLLOW:
            return f"@{self.actor.username} подписался(-ась) на вас."
        elif self.type == self.NotificationType.COMMENT:
            return f"@{self.actor.username} оставил(а) комментарий."
        elif self.type == self.NotificationType.MENTION:
            return f"@{self.actor.username} упомянул(а) вас."
        elif self.type == self.NotificationType.NEW_POST:
            return f"@{self.actor.username} выложил(а) новый пост!"
        return "У вас новое уведомление!"

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "grouping_key"]),
        ]