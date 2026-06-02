from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'id', 
            'name', 
            'email', 
            'phone',  
            'location', 
            'description', 
            'is_approved', 
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    