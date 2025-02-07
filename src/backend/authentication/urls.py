from django.urls import path
from . import views
from .Oauth import Oauth

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('user/', views.get_user, name='get_user'),
    # path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/refresh/', views.CookieTokenRefreshView.as_view(), name='token_refresh'),
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('verify-token/', views.verify_token, name='token_verify'),
    path('update_user/', views.update_user, name='update_user'),
    path('profile/image/', views.update_profile_image, name='profile_image_update'),
    path('2fa/enable/', views.enable_2fa, name='enable_2fa'),
    path('2fa/verify/', views.verify_2fa, name='verify_2fa'),
    path('2fa/disable/', views.disable_2fa, name='disable_2fa'),
    path('oauth/', Oauth, name='Oauth'),
]