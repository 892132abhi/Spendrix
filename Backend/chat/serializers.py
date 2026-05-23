from rest_framework import serializers
from .models import ChatMessage

class ChatSerializer(serializers.ModelSerializer):
    
    sender_username = serializers.CharField(source='sender.username',read_only=True)
    
    sender_role = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields=['id','sender_username','sender_role','message','timestamp']
        
    def get_sender_role(self,obj):
        return getattr(obj.sender,'role','User')