from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import ChatRoom, ChatMessage
from .serializers import ChatSerializer
from interviews.models import Interview


class ChatView(APIView):
    def get(self, request, room_type, interview_id):
        user = request.user

        if not user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if room_type not in ["candidate", "interviewer", "group"]:
            return Response(
                {"error": "Invalid chat room type"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            interview = Interview.objects.select_related(
                "application__candidate__profile",
                "application__job__created_by",
                "hr_name",
                "interviewer__profile"
            ).get(id=interview_id)

            room, created = ChatRoom.objects.get_or_create(
                interview=interview,
                room_type=room_type,
            )

            if created:
                self.add_room_participants(room, interview, room_type)

            if not room.participants.filter(id=user.id).exists():
                return Response(
                    {"error": "You are not allowed to access this chat"},
                    status=status.HTTP_403_FORBIDDEN
                )

            messages = ChatMessage.objects.filter(room=room).order_by("timestamp")
            serializer = ChatSerializer(messages, many=True)

            candidate_name = interview.application.candidate.profile.full_name
            interviewer_name = interview.interviewer.profile.full_name

            return Response({
                "messages": serializer.data,
                "participants": {
                    "candidate_name": candidate_name,
                    "interviewer_name": interviewer_name,
                },
                "room_type": room_type,
                "session_info": {
                    "position": interview.application.job.title,
                    "status": "Active",
                }
            }, status=status.HTTP_200_OK)

        except Interview.DoesNotExist:
            return Response(
                {"error": "Interview not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def add_room_participants(self, room, interview, room_type):
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
