from django.db import models
from company.models import Company
from django.conf import settings
from datetime import timedelta
# Create your models here.
class Job(models.Model):
    JOB_STATUS = (
        ('OPEN','Open'),
        ('CLOSED','Closed')
    )
    
    JOB_TYPES_CHOICES=(
        ('FULL_TIME','Full Time'),
        ('PART_TIME','Part Time'),
        ('INTERN_SHIP','Intern Ship'),
        ('REMOTE','Remote')
    )
    JOB_MODE_CHOICES=(
        ('REMOTE','Remote'),
        ('ONSITE','On Site'),
        ('HYBRID','Hybrid')
    )
    title = models.CharField(max_length=200)
    
    company  = models.ForeignKey(Company,on_delete=models.CASCADE,related_name='jobs')
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='posted_jobs')
    
    job_mode=models.CharField(max_length=20,choices=JOB_MODE_CHOICES,default='ONSITE')
    
    description = models.TextField()
    
    skills = models.TextField()
    
    salary = models.CharField(max_length=250,blank=True)
    
    experience = models.PositiveIntegerField(default=0)
    
    location = models.CharField(max_length=250)
    
    Qualification = models.CharField(max_length=255,blank=True,null=True)

    ai_processed = models.BooleanField(default=False)
    
    job_type = models.CharField(max_length=20,choices=JOB_TYPES_CHOICES,default='FULL_TIME')
    
    job_status = models.CharField(max_length=20,choices=JOB_STATUS,default='OPEN')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    expires_at = models.DateTimeField(blank=True,null=True)

    def __str__(self):
        return self.title
    
    
    