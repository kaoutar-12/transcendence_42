from django.urls import path
from . import views

urlpatterns = [
	path('join/', views.join_queue, name='join_queue'),
	path('leave/', views.leave_queue, name='leave_queue'),
	path('create/', views.create_match, name='create_match'),
]