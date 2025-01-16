from django.urls import path
from . import views
urlpatterns = [
	path('queue/join/', views.join_queue, name='join_queue'),
	path('queue/join/', views.leave_queue, name='leave_queue'),
]