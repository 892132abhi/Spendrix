from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from interviews.models import Interview
from .models import ChatRoom

User = get_user_model()


class GetOrCreateChatRoom(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        other_user_id = request.data.get("other_user_id")
        interview_id = request.data.get("interview_id")
        if not other_user_id:
            return Response(
                {"error": "other_user_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        other_user = get_object_or_404(User, id=other_user_id)
        current_user = request.user

        if current_user.id == other_user.id:
            return Response(
                {"error": "You cannot chat with yourself"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        interview = get_object_or_404(Interview, id=interview_id)

        user1, user2 = sorted([current_user, other_user], key=lambda user: user.id)
        room, _ = ChatRoom.objects.get_or_create(interview=interview,user1=user1, user2=user2)

        return Response({"room_id": str(room.id)}, status=status.HTTP_200_OK)


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)

        if request.user.id not in [room.user1_id, room.user2_id]:
            return Response(
                {"error": "Unauthorized"},
                status=status.HTTP_403_FORBIDDEN,
            )

        messages = [
            {
                "id": message.id,
                "sender_id": message.sender_id,
                "sender_username": message.sender.username,
                "text": message.text,
                "timestamp": message.timestamp.isoformat(),
            }
            for message in room.messages.select_related("sender").all()
        ]

        return Response(messages, status=status.HTTP_200_OK)
