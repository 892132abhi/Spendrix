from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    posted_by_username = serializers.CharField(source='created_by.username', read_only=True)
    class Meta:
        model = Job
        fields = [
                'id', 
                'title', 
                'company',         
                'company_name',    
                'created_by', 
                'posted_by_username',
                'job_mode', 
                'description', 
                'skills', 
                'salary', 
                'experience', 
                'location', 
                'Qualification', 
                'job_type', 
                'job_status', 
                'created_at', 
                'updated_at',
                'expires_at'
            ]
        read_only_fields = ['company', 'created_by', 'created_at', 'updated_at']
        