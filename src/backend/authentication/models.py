from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import transaction
class User(AbstractUser):
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=50, blank=True, null=True)
    profile_image = models.ImageField(
                    upload_to='user_profiles/',
                    blank=True,
                    null=True)
    friends = models.ManyToManyField('self', symmetrical=True ,blank=True)
    blocked_users = models.ManyToManyField('self', symmetrical=False, related_name='blocked_by' ,blank=True)
    is_42 = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    def add_friend(self, user):
        if user not in self.friends.all() and user not in self.blocked_users.all() and user not in self.blocked_by.all():
            self.friends.add(user)
            user.friends.add(self)
    
    @transaction.atomic
    def remove_friend(self, user):
        if self.friends.filter(id=user.id).exists():
            self.friends.remove(user)
            user.friends.remove(self)
    @transaction.atomic
    def block_user(self, user):
        if self.friends.filter(id=user.id).exists():
            self.friends.remove(user)
            user.friends.remove(self)
        if user not in self.blocked_users.all() and user not in self.blocked_by.all():
            self.blocked_users.add(user)
    @transaction.atomic
    def unblock_user(self, user):
        if user in self.blocked_users.all():
            self.blocked_users.remove(user)


class TwoFactorAuth(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    secret_key = models.CharField(max_length=32)
    is_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'two_factor_auth'

