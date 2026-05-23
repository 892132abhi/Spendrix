from django.db import models
from applications.models import Application
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import uuid


class Interview(models.Model):
    STATUS_CHOICES = (
        ('SHEDULED', 'Sheduled'),
        ('COMPLETED', 'Completed'),
        ('SHORT_LISTED', 'Short listed'),
        ('CANCELLED', 'Cancelled')
    )

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')

    interviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assined_interviewer',
        null=True,
        blank=True
    )

    hr_name = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_interviews'
    )

    sheduled_date = models.DateTimeField()
    note = models.TextField()
    strength = models.TextField(blank=True, null=True)
    weakness = models.TextField(blank=True, null=True)
    decision_note = models.TextField(blank=True, null=True)
    meeting_link = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SHEDULED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.application.candidate.username} - interview"


class InterviewInvitation(models.Model):
    email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    interview = models.ForeignKey(
        Interview,
        on_delete=models.CASCADE,
        related_name="invitations",
        null=True,
        blank=True
    )

    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_interview_invitations"
    )

    is_accepted = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_accepted and timezone.now() < self.expires_at

    def __str__(self):
        return f"Interview invitation for {self.email}"