from firebase_admin import messaging
from .firebase import initialize_firebase

def send_push_notification(token, title, body):
    initialize_firebase()

    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
    )

    return messaging.send(message)