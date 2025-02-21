from django.urls import path
from . import views

urlpatterns = [
    path('/history/<int:user_id>', views.get_match_history, name='match_history'),
    path('/history/<int:user_id>/winrate', views.get_winrate, name='match_winrate'),
]