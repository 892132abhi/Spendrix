# Backend/accounts/middleware.py
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

@database_sync_to_async
def get_user_from_token(token):
    try:
        auth = JWTAuthentication()
        validated = auth.get_validated_token(token)
        return auth.get_user(validated)
    except Exception:
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        cookies = {}
        for header_name, header_value in scope.get("headers", []):
            if header_name == b"cookie":
                cookie_header = header_value.decode()
                for item in cookie_header.split(";"):
                    if "=" in item:
                        key, value = item.strip().split("=", 1)
                        cookies[key] = value

        token = cookies.get(settings.SIMPLE_JWT["AUTH_COOKIE"])

        scope["user"] = await get_user_from_token(token) if token else AnonymousUser()

        return await self.app(scope, receive, send)