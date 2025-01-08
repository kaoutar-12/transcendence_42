# from django.urls import path
# from .views import register, login, LogoutView
# from rest_framework_simplejwt.views import TokenRefreshView

# urlpatterns = [
#     path('register/', register, name='register'),
#     path('login/', login, name='login'),
#     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('logout/', LogoutView.as_view(), name='logout'),
# ]
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('user/', views.get_user, name='get_user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-token/', views.verify_token, name='token_refresh'),
]