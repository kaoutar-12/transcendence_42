from django.db import models
from django.contrib.auth.models import AbstractUser
from django_otp.plugins.otp_totp.models import TOTPDevice
import pyotp


class User(AbstractUser):
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=50, blank=True, null=True)
    profile_image = models.ImageField(
                    upload_to='user_profiles/',
                    blank=True,
                    null=True)
    otp_secret = models.CharField(max_length=32, blank=True)  # Stores TOTP secret key
    is_2fa_enabled = models.BooleanField(default=False)  
    
    def enable_2fa(self):
        self.otp_secret = pyotp.random_base32()  # Generate secret
        self.is_2fa_enabled = True
        self.save()

    def disable_2fa(self):
        self.otp_secret = ""
        self.is_2fa_enabled = False
        self.save()

    class Meta:
        app_label = 'authentication'
# Create your models here.
