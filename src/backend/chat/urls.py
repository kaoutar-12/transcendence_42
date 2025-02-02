from django.urls import path

from . import consumers

from .views import RoomsView, MessagesView, RoomDetailView

urlpatterns = [
    path('rooms/', RoomsView.as_view()),
    path('rooms/<uuid:room_id>/', RoomDetailView.as_view()),
    path('messages/', MessagesView.as_view()),
]

websocket_urlpatterns = [
    path('ws/chat/<uuid:room_id>/', consumers.ChatConsumer.as_asgi()),
]