from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Добавляем поле bio, которого не хватало
    bio = models.TextField(max_length=500, blank=True, null=True, verbose_name='О себе')
    
    # Твои существующие поля (добавил blank=True и null=True, чтобы не было ошибок, если они не заполнены)
    job = models.CharField(max_length=50, verbose_name='Текущая работа', default='Не указана', blank=True, null=True)
    rank = models.CharField(max_length=50, verbose_name='Ранг', default='Новичок', blank=True, null=True)
    
    # Поле аватара (сделал его необязательным для заполнения)
    avatar = models.ImageField(upload_to='user_avatar', blank=True, null=True, verbose_name='Аватар')
    
    def __str__(self):
        return self.username