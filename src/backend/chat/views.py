from rest_framework import status
from django.shortcuts import render
from rest_framework.decorators import APIView, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Room
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


from .serializers import CreateMessageSerializer, CreateRoomSerializer
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class RoomsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rooms = Room.objects.filter(users__in=[request.user])

        roomData = []
        for room in rooms:
            user = room.users.exclude(id=request.user.id).first()
            last_message = room.messages.last()
            roomData.append({
                'room_id': room.id,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    # 'profile_image': user.profile_image,
                    'nickname': user.nickname
                },
                'last_message': last_message.content if last_message else [],
                'time': last_message.time if last_message else [],
            })
        return Response(roomData, status=status.HTTP_200_OK)

    
    def post(self, request):
        validator = CreateRoomSerializer(data=request.data, context={'request': request})
        if validator.is_valid():
            userId = validator.validated_data['userId']
            other_user = User.objects.get(id=userId)
            logged_user = request.user

            room = Room.objects.filter(users__in=[logged_user, other_user])
            room = room.annotate(user_count=models.Count('users')).filter(user_count=2).first()
            created = False

            if not room:
                room = Room.objects.create()
                room.users.set([logged_user, other_user])
                created = True

            # Prepare WebSocket notification
            channel_layer = get_channel_layer()
            response_data = {
                'room_id': room.id,
                'userIds': [logged_user.id, other_user.id],
                'messages': list(room.messages.values()),
                'MSG': 'Room created successfully' if created else 'Room already exists'
            }

            # Send real-time update to both users
            async_to_sync(channel_layer.group_send)(
                f"gloabl_{logged_user.id}",  # User-specific group
                {
                    'type': 'room_update',
                    'data': response_data
                }
            )

            async_to_sync(channel_layer.group_send)(
                f"gloabl_{other_user.id}",  # Other user's group
                {
                    'type': 'room_update',
                    'data': response_data
                }
            )


            return Response(response_data, 
                          status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        return Response(validator.errors, status=status.HTTP_400_BAD_REQUEST)

class RoomDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        try:
            room = Room.objects.get(id=room_id)
            other_user = room.users.exclude(id=request.user.id).first()

            return Response({
                'other_user': {
                    'id': other_user.id,
                    'username': other_user.username,
                    'email': other_user.email,
                    # 'profile_image': other_user.profile_image,
                    'nickname': other_user.nickname
                }
            })
        except Room.DoesNotExist:
            return Response("Room not found", status=status.HTTP_404_NOT_FOUND)

class MessagesPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50

class MessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            room_id = request.query_params.get('room_id')
            room = Room.objects.get(id=room_id)

            if not room:
                 return Response("Room not found", status=status.HTTP_404_NOT_FOUND)

            messages = room.messages.order_by('-time')
            paginator = MessagesPagination()
            paginated_messages = paginator.paginate_queryset(messages, request)

            serialized_messages = [
                {
                    'content': message.content,
                    'time': message.time,
                    'id': message.id,
                    'sender_id': message.sender.id,
                    'sender_username': message.sender.username,
                }
                for message in paginated_messages
            ]

            return paginator.get_paginated_response(serialized_messages)
        except Exception as e:
            print(e)
            return Response("error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        validator = CreateMessageSerializer(data=request.data, context={'request': request})
        if validator.is_valid():
            room_id = validator.validated_data['room_id']
            content = validator.validated_data['content']
            room = Room.objects.get(id=room_id)
        
            created_message = room.messages.create(
                content=content,
                sender=request.user
            )
            created_message.save()
            
            return Response("Message created successfully", status=status.HTTP_201_CREATED)
        
        return Response(validator.errors, status=status.HTTP_400_BAD_REQUEST)

        
        