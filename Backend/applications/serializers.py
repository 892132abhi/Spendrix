from rest_framework import serializers
from .models import Application

class ApplicationSerializer(serializers.ModelSerializer):
    
    candidate_name = serializers.CharField(source = 'candidate.username',read_only=True)
    candidate_email = serializers.EmailField(source='candidate.email',read_only=True)
    
    job_title = serializers.CharField(source='job.title',read_only=True)
    job_location = serializers.CharField(source='job.location',read_only=True)
    
    applied_at_date = serializers.DateTimeField(
        source='applied_at', 
        format="%d %b %Y", 
        read_only=True
    )
    
    class Meta:
        model = Application
        fields=['id','candidate','candidate_name','candidate_email','job','job_title','job_location','status','resume','applied_at_date','ai_score','interview_status']
        read_only_fields=['status','applied_at','candidate','job']
        

