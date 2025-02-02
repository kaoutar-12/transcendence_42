from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.http import SimpleCookie
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs

@database_sync_to_async
def get_user(token_key):
    try:
        access_token = AccessToken(token_key)
        user = get_user_model().objects.get(id=access_token['user_id'])
        return user
    except Exception:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        cookies = {}
        headers = dict(scope["headers"])
        cookie_header = headers.get(b"cookie", b"").decode()
        if cookie_header:
            parsed = SimpleCookie()
            parsed.load(cookie_header)
            cookies = {k: v.value for k, v in parsed.items()}

        # Get token from cookies
        token = cookies.get("access_token")
        
        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)