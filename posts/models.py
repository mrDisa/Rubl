from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from users.models import User

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, blank=True, null=True)
    content = models.TextField(max_length=600)
    media = models.ImageField(upload_to='media/%Y%m%d', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Автор: {self.author}, Заголовок поста: {self.title}"

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField(max_length=300)
    media = models.ImageField(upload_to='media_comments/%Y/%m%d', blank=True)
    created_at = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f'Автор комментария: {self.author}, Название поста: {self.post}'

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='who_liked')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    
    def __str__(self):
        return f"{self.user} лайкнул пост {self.post.title}"

# === СИГНАЛ (ТРИГГЕР) ДЛЯ СОЗДАНИЯ УВЕДОМЛЕНИЙ ===
@receiver(post_save, sender=Post)
def create_notification_for_new_post(sender, instance, created, **kwargs):
    # Выводим в консоль сервера сообщение, чтобы понять, сработал ли сигнал
    print(f"\n--- [DEBUG] СИГНАЛ СРАБОТАЛ! Новый пост создан: {created} ---")
    
    if created:
        # Прячем импорты внутрь функции, чтобы избежать ошибки циклического импорта
        from interactions.models import Follow
        from notifications.models import Notification
        
        # 1. Находим всех подписчиков автора нового поста
        followers = Follow.objects.filter(following=instance.author)
        print(f"--- [DEBUG] Найдено подписчиков у автора {instance.author.username}: {followers.count()} ---")
        
        # 2. Формируем список уведомлений
        notifications = []
        for follow in followers:
            print(f"--- [DEBUG] Готовим уведомление для: {follow.follower.username} ---")
            notifications.append(
                Notification(
                    user=follow.follower,           # Кому летит уведомление (подписчику)
                    actor=instance.author,          # Кто виновник (автор поста)
                    type=Notification.NotificationType.NEW_POST, # Наш новый тип
                    post=instance                   # Прикрепляем сам пост
                )
            )
        
        # 3. Массово сохраняем в базу данных
        if notifications:
            Notification.objects.bulk_create(notifications)
            print("--- [DEBUG] Уведомления успешно сохранены в БД! ---\n")
        else:
            print("--- [DEBUG] Уведомлять некого (у автора нет подписчиков). ---\n")