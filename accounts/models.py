from django.db import models

class User(models.Model):
    gmail = models.CharField(max_length=100)
    username = models.CharField(max_length=16)
    password = models.CharField(max_length=50)
    