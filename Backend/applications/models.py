import os
from django.db import models
from django.conf import settings
from jobs.models import Job

# ------------------------------------------------------------------
# S3 Path Helpers for Job Applications App
# ------------------------------------------------------------------
def application_resume_path(instance, filename):
    # private/applications/user_<id>/filename.pdf
    return f'private/applications/user_{instance.candidate.id}/{filename}'


class Application(models.Model):
    STATUS_CHOICES = (
        ('APPLIED', 'Applied'),
        ('SHORT_LISTED', 'Short Listed'),
        ('INTERVIEW', 'Interview'),
        ('HIRED', 'Hired'),
        ('REJECTED', 'Rejected')
    )
    candidate = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applicants')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPLIED')
    ai_score = models.FloatField(blank=True, null=True)
    interview_status = models.CharField(max_length=500, blank=True, null=True)
    
    # S3 Linked Field for this specific job application instance
    resume = models.FileField(upload_to=application_resume_path, blank=True, null=True)
    
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('candidate', 'job')
        
    def __str__(self):
        return f"{self.candidate.username} - {self.job.title}"