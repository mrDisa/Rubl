from django.db import models

class Post(models.Model):
    name = models.CharField(max_length=20)
    description = models.TextField(max_length=200)
    media = models.ImageField(upload_to='media/%Y%m%d', blank=True)
