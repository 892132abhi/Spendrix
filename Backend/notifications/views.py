from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status  
from .models import Notification,FCMToken
from .serializers import NotificationSerializer

class SaveFCMTokenView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        token = request.data.get("token")
        if not token:
            return Response({"message":"token is required"},status=400)
        FCMToken.objects.update_or_create(token=token,defaults={"user":request.user})
        return Response({"message":"Token Saved"})

class NotificationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        
        notification_list = Notification.objects.filter(recipient=request.user)[:15]
        
        
        unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        
        return Response({
            "notifications": NotificationSerializer(notification_list, many=True).data,
            "unread_count": unread_count
        })
        
        
class NotificationUpdate(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, id):
        try:
            notification = Notification.objects.get(id=id, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({"detail": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)