from django.db import models

class Post(models.Model):
    name = models.CharField(max_length=20)
    description = models.TextField(max_length=200)
    media = models.ImageField(upload_to='media/%Y%m%d', blank=True)
    
    author_name = models.CharField(max_length=30, default='Unknown')
    author_user = models.CharField(max_length=20, default='')
    date = models.DateField(auto_now_add=True, null=True)
    modified_date = models.DateField(auto_now=True)
    
