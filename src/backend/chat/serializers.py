from .models import Room
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class CreateRoomSerializer(serializers.Serializer):
    userId = serializers.IntegerField()

    def validate(self, data):
        # kanchofo wash kayn had user f database
        try:
            user = User.objects.get(id=data['userId'])
        except User.DoesNotExist:
            raise serializers.ValidationError('User not found')

        # kanchofo wash had user bgha ydir room m3a rasso
        user_id = self.context['request'].user.id
        if user_id == data['userId']:
            raise serializers.ValidationError('You cannot create a room with yourself')

        return data
    

class CreateMessageSerializer(serializers.Serializer):
    room_id = serializers.CharField()
    content = serializers.CharField()

    def validate(self, data):
        # kanchofo wash had room kayn
        try:
            room = Room.objects.get(id=data['room_id'])
        except Room.DoesNotExist:
            raise serializers.ValidationError('Room not found')

        # kanchofo wash had user kayn f had room
        user_id = self.context['request'].user.id
        if not room.users.filter(id=user_id).exists():
            raise serializers.ValidationError('You are not in this room')

        return data