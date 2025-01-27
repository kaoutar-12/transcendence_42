from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=50, blank=True, null=True)
    profile_image = models.ImageField(
                    upload_to='user_profiles/',
                    blank=True,
                    null=True)
   

    class Meta:
        app_label = 'authentication'
# Create your models here.
