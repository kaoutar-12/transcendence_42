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
    def authenticate(self, request):
        header = self.get_header(request)
        
        # If no token, return None (allows request to proceed)
        if header is None:
            return None
            
        try:
            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None
                
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except Exception as e:
            # Instead of raising an exception, return None for invalid tokens
            # This allows the request to proceed to permission checking
            return None


