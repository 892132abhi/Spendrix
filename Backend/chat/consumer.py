import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.db.models import Q

from .models import ChatRoom, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.room_id = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_id}"

        if not self.user.is_authenticated:
            await self.close()
            return

        is_allowed = await self.is_user_in_room(self.room_id, self.user.id)
        if not is_allowed:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message_text = data.get("message", "").strip()
        if not message_text:
            return

        saved_message = await self.save_message(
            room_id=self.room_id,
            sender_id=self.user.id,
            text=message_text,
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": saved_message["text"],
                "sender_id": saved_message["sender_id"],
                "sender_username": saved_message["sender_username"],
                "timestamp": saved_message["timestamp"],
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def is_user_in_room(self, room_id, user_id):
        return ChatRoom.objects.filter(id=room_id).filter(
            Q(user1_id=user_id) | Q(user2_id=user_id)
        ).exists()

    @database_sync_to_async
    def save_message(self, room_id, sender_id, text):
        message = Message.objects.create(
            room_id=room_id,
            sender_id=sender_id,
            text=text,
        )

        return {
            "text": message.text,
            "sender_id": message.sender_id,
            "sender_username": message.sender.username,
            "timestamp": message.timestamp.isoformat(),
        }
