from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage,ChatRoom
from interviews.models import Interview

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.interview_id = self.scope['url_route']['kwargs']['interview_id']
        self.room_type = self.scope['url_route']['kwargs']['room_type']
        self.user =self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return

        if self.room_type not in ["candidate", "interviewer", "group"]:
            await self.close()
            return
        
        self.chat_room = await self.get_or_create_chat_room(self.interview_id,self.room_type) 
        if not self.chat_room:
            await self.close()
            return 
        
        is_allowed = await self.is_user_allowed(self.chat_room.id,self.user.id)
        
        if not is_allowed:
            await self.close()
            return 
        
        self.room_group_name=f"chat_interview_{self.interview_id}_{self.room_type}"
        
        await self.channel_layer.group_add(self.room_group_name,self.channel_name)
        await self.accept()
        
        
        
    async def disconnect(self,close_code):
        if hasattr(self,"room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name,self.channel_name)
        
    async def receive_json(self, content):
        message = content.get('message')
        if not message:
            return 
        saved_message = await self.save_message(self.chat_room.id,self.user.id,message)
        await self.channel_layer.group_send(self.room_group_name,{
            "type": "chat_message",
            "message": saved_message.message,
            "username": self.user.username,
            "role": getattr(self.user, "role", "User"),
        })
        
    async def chat_message(self,event):
        await self.send_json({
            "message":event['message'],
            "username":event['username'],
            "sender":event['username'],
            "role":event['role']
        })
        
    @database_sync_to_async
    def get_or_create_chat_room(self,interview_id,room_type):
        try:
            interview = Interview.objects.select_related(
                "application__candidate",
                "application__job__created_by",
                "hr_name",
                "interviewer"
            ).get(id=interview_id)
            
            room,created = ChatRoom.objects.get_or_create(
                interview = interview,
                room_type = room_type
            )
            if created:
                self.add_room_participants(room,interview,room_type)
            return room
        
        except Interview.DoesNotExist:
            return None
        
    @database_sync_to_async
    def is_user_allowed(self,room_id,user_id):
        return ChatRoom.objects.filter(
            id=room_id,
            participants__id=user_id
        ).exists()

    @database_sync_to_async
    def save_message(self,room_id,user_id,message):
        return ChatMessage.objects.create(
            room_id = room_id,
            sender_id = user_id,
            message = message
        )

    def add_room_participants(self,room,interview,room_type):
        hr_user = interview.hr_name or interview.application.job.created_by
        candidate = interview.application.candidate
        interviewer = interview.interviewer

        participants = [hr_user]

        if room_type == "candidate":
            participants.append(candidate)
        elif room_type == "interviewer":
            participants.append(interviewer)
        elif room_type == "group":
            participants.extend([candidate, interviewer])

        room.participants.add(*[user for user in participants if user])
