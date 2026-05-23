from django.db import models
from django.conf import settings
from interviews.models import Interview


class ChatRoom(models.Model):
    interview = models.OneToOneField(
        Interview,
        on_delete=models.CASCADE,
        related_name="chat_room"
    )

    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="candidate_chat_rooms"
    )

    interviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interviewer_chat_rooms"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat for interview {self.interview.id}"


class ChatMessage(models.Model):
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.sender.username}: {self.message[:20]}"f"{self.sender.username}: {self.message[:20]}"f"{self.sender.username}: {self.message[:20]}""{self.sender.username}: {self.message[:20]}"