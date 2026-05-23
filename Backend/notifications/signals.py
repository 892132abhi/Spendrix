from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from .models import Notification

def create_notification(recipient, title, message):
    notification = Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
    )

    def broadcast_notification():
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        async_to_sync(channel_layer.group_send)(
            f"user_notifications_{recipient.id}",
            {
                "type": "send_notification",
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat(),
            }
        )

    transaction.on_commit(broadcast_notification)

    return notification
