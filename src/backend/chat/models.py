import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.forms import ValidationError

User = get_user_model()

class Room(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, unique=True, default=uuid.uuid4)
    users = models.ManyToManyField(User, related_name='room')

    def clean(self):
        if self.users.count() != 2:
            raise ValidationError('Room must have 2 users')
        
    def __str__(self):
        return f"Room {self.id} with users: {', '.join([user.username for user in self.users.all()])}"

class Message(models.Model):
    content = models.TextField()
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    time = models.TimeField(auto_now_add=True)
    read_by = models.ManyToManyField(User, related_name='read_messages', blank=True)

    def __str__(self):
        return f"{self.sender.username}: {self.content}"
