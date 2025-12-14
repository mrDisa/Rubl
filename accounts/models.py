import uuid
from django.db import models

class User(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    
    gmail = models.CharField(max_length=100, blank=True)
    
    username = models.CharField(max_length=16, blank=True)
    password = models.CharField(max_length=50, blank=True)
    
    name = models.CharField(max_length=30)
    
    auth_status = models.BooleanField(default=False)
    
    def __str__(self):
        return self.username