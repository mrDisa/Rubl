import uuid
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    name = models.OneToOneField(User, verbose_name=("Имя"), on_delete=models.CASCADE, default='g')
    avatar = models.ImageField(upload_to='avatars', default='avatars/df.jpg')