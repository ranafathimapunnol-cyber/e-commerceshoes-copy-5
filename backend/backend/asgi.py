# backend/asgi.py
from notifications import consumers
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') 

# Import consumers

application = ProtocolTypeRouter({ 
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
            ])
        )
    ),
})
