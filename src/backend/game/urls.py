from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

urlpatterns = [
  path('/history/<int:user_id>', views.MatchHistoryViewSet.as_view({'get': 'list'})),
]