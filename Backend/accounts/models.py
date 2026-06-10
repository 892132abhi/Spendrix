import os
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from django.conf import settings
from django.core.validators import RegexValidator
from company.models import Company
from .managers import UserManager

# ------------------------------------------------------------------
# S3 Path Helpers for User Profile App
# ------------------------------------------------------------------
def user_profile_pic_path(instance, filename):
    # public/profiles/user_<id>/filename.jpg
    return f'public/profiles/user_{instance.user.id}/{filename}'

def user_resume_path(instance, filename):
    # private/resumes/user_<id>/filename.pdf
    return f'private/resumes/user_{instance.user.id}/{filename}'


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('HR', 'HR'),
        ('INTERVIEWER', 'Interviewer'),
        ('CANDIDATE', 'Candidate')
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CANDIDATE')
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_expiry = models.DateTimeField(null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    def is_otp_valid(self):
        return self.otp and self.otp_expiry and timezone.now() < self.otp_expiry


phone_validator = RegexValidator(
    regex=r'^\+?\d{10,15}$',
    message='Enter a valid phone number'
)


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    first_name = models.CharField(max_length=200, blank=True)
    last_name = models.CharField(max_length=200, blank=True)
    phone_number = models.CharField(max_length=15, validators=[phone_validator], blank=True)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    
    # S3 Linked Fields
    resume = models.FileField(upload_to=user_resume_path, null=True, blank=True)
    profile_pic = models.ImageField(upload_to=user_profile_pic_path, blank=True, null=True)
    
    resume_text = models.TextField(blank=True, null=True)
    skills = models.CharField(max_length=255, blank=True, null=True)
    experience_years = models.IntegerField(blank=True, default=0)
    bio = models.TextField(blank=True)
    department = models.CharField(max_length=200, blank=True)
    linked_in = models.URLField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f'{self.user.username} {self.user.role}'

    @property
    def full_name(self):
        if self.first_name and self.last_name:
            return f'{self.first_name} {self.last_name}'
        return self.user.username