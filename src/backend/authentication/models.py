from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    
    class Meta:
        app_label = 'authentication'
# Create your models here.
