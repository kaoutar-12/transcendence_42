from django.contrib import admin

# Register your models here
from .models import Room, Message

admin.site.register(Message)
admin.site.register(Room)
