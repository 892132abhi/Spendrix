from django.db import models

# Create your models here.

class Company(models.Model):
    name=models.CharField(max_length=255)
    email = models.EmailField(blank=True,null=True)
    phone = models.CharField(max_length=20,blank=True,null=True)
    location = models.CharField(max_length=255,blank=True,null=True)
    description = models.TextField(blank=True,null=True)
    is_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)

    otp = models.CharField(max_length=6,blank=True,null=True)
    otp_expiry = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name