"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter,URLRouter
import chat.routing
from accounts.middleware import JWTAuthMiddleware
import notifications.routing

combined_websocket_routes = chat.routing.websocket_urlpatterns + notifications.routing.websocket_urlpatterns

application = ProtocolTypeRouter({
    "http":get_asgi_application(),
    "websocket":JWTAuthMiddleware(
        URLRouter(
            combined_websocket_routes
        )
    )
})

