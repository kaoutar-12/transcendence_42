from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'match-history', views.MatchHistoryViewSet, basename='match-history')


urlpatterns = [
  path('/history', include(router.urls)),
  path('/history/<int:user_id>', views.MatchHistoryViewSet.as_view({'get': 'list'})),
]