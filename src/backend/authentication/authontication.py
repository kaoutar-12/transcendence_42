from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
# from rest_framework_simplejwt.views import TokenRefreshView
# from rest_framework.response import Response

class CustomJWTAuthentication(JWTAuthentication):
    def get_header(self, request):
        header = super().get_header(request)
        if header:
            return header
        cookie_token = request.COOKIES.get('access_token')
        if cookie_token:
            return f'Bearer {cookie_token}'.encode()
        return None
