from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.http import SimpleCookie
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
import urllib

@database_sync_to_async
def get_user(token_key):
    try:
        token_key = token_key.replace('Bearer ', '')
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        return get_user_model().objects.get(id=user_id)
    except Exception as e:
        print(f"Auth error: {str(e)}")
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        if scope["type"] not in ["websocket", "https"]:
            return await super().__call__(scope, receive, send)

        query_string = scope.get('query_string', b'').decode()
        query_params = urllib.parse.parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        headers = dict(scope["headers"])
        cookie_header = headers.get(b"cookie", b"").decode()
        if cookie_header:
            parsed = SimpleCookie()
            parsed.load(cookie_header)
            cookies = {k: v.value for k, v in parsed.items()}
            #get token from cookies
            token = token or cookies.get("access_token")

        if token:
            try:
                access_token = AccessToken(token)
                user = await database_sync_to_async(get_user_model().objects.get)(id=access_token['user_id'])
                scope['user'] = user
            except Exception as e:
                print(f"Auth error: {str(e)}")
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)