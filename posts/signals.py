from django.db.models.signals import post_save
from django.dispatch import receiver

# Импортируем все модели из постов
from .models import Post, Like, Comment
# Импортируем модель подписок
from interactions.models import Follow


# === 1. СИГНАЛ: НОВЫЙ ПОСТ ===
@receiver(post_save, sender=Post)
def create_notification_for_new_post(sender, instance, created, **kwargs):
    print(f"\n--- [DEBUG] СИГНАЛ СРАБОТАЛ! Новый пост создан: {created} ---")
    
    if created:
        # Прячем импорт внутрь, чтобы не было ошибки цикличного импорта
        from notifications.models import Notification
        
        followers = Follow.objects.filter(following=instance.author)
        print(f"--- [DEBUG] Найдено подписчиков у автора {instance.author.username}: {followers.count()} ---")
        
        notifications = []
        for follow in followers:
            notifications.append(
                Notification(
                    user=follow.follower,           
                    actor=instance.author,          
                    # Используем getattr, чтобы код не упал, если бэкендер забыл добавить тип в модель
                    type=getattr(Notification.NotificationType, 'NEW_POST', 'NEW_POST'), 
                    text=f"@{instance.author.username} опубликовал(а) новый пост.",
                    post=instance                   
                )
            )
        
        if notifications:
            Notification.objects.bulk_create(notifications)
            print("--- [DEBUG] Уведомления успешно сохранены в БД! ---\n")


# === 2. СИГНАЛ: ЛАЙКИ НА ПОСТЫ И КОММЕНТАРИИ ===
@receiver(post_save, sender=Like)
def create_notification_for_like(sender, instance, created, **kwargs):
    if created:
        from notifications.models import Notification
        
        # А) Если лайкнули КОММЕНТАРИЙ
        if getattr(instance, 'comment', None):
            if instance.comment.author != instance.user:  # Не отправляем, если лайкнул сам себя
                Notification.objects.create(
                    user=instance.comment.author,
                    actor=instance.user,
                    type=getattr(Notification.NotificationType, 'LIKE', 'LIKE'), 
                    text=f"@{instance.user.username} оценил(а) ваш комментарий.",
                    post=instance.comment.post  # Прикрепляем пост, чтобы клик по уведомлению работал!
                )
                
        # Б) Если лайкнули ПОСТ
        elif getattr(instance, 'post', None):
            if instance.post.author != instance.user:
                Notification.objects.create(
                    user=instance.post.author,
                    actor=instance.user,
                    type=getattr(Notification.NotificationType, 'LIKE', 'LIKE'),
                    text=f"@{instance.user.username} оценил(а) ваш пост.",
                    post=instance.post
                )


# === 3. СИГНАЛ: НОВЫЕ КОММЕНТАРИИ ===
@receiver(post_save, sender=Comment)
def create_notification_for_comment(sender, instance, created, **kwargs):
    if created:
        from notifications.models import Notification
        
        # Уведомляем автора поста (если это не он сам написал коммент)
        if instance.post.author != instance.author:
            Notification.objects.create(
                user=instance.post.author,
                actor=instance.author,
                type=getattr(Notification.NotificationType, 'COMMENT', 'COMMENT'),
                text=f"@{instance.author.username} оставил(а) комментарий под вашим постом.",
                post=instance.post
            )


# === 4. СИГНАЛ: НОВЫЕ ПОДПИСКИ ===
@receiver(post_save, sender=Follow)
def create_notification_for_follow(sender, instance, created, **kwargs):
    if created:
        from notifications.models import Notification
        
        Notification.objects.create(
            user=instance.following,  # Кому приходит уведомление
            actor=instance.follower,  # Кто подписался
            type=getattr(Notification.NotificationType, 'FOLLOW', 'FOLLOW'),
            text=f"@{instance.follower.username} подписался(ась) на вас.",
            # post=None  (тут поста нет, фронтенд поймет это и сделает ссылку на профиль)
        )