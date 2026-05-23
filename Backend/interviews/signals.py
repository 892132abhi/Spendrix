from django.db.models.signals import post_save
from .models import Interview
from notifications.signals import create_notification
from django.dispatch import receiver
from django.db import transaction
from .models import InterviewInvitation
from .tasks import send_interviewer_invitation_email

@receiver(post_save, sender=Interview)
def create_interview_notification(sender, instance, created, **kwargs):
    if not created:
        return

    if instance.interviewer:
        create_notification(
            recipient=instance.interviewer,
            title="Interview Scheduled!",
            message=f"You have a new interview with {instance.application.candidate.username}"
        )

        invitation = InterviewInvitation.objects.create(
            email=instance.interviewer.email,
            interview=instance,
            invited_by=instance.hr_name
        )

        transaction.on_commit(
            lambda: send_interviewer_invitation_email.delay(invitation.id)
        )

    create_notification(
        recipient=instance.application.candidate,
        title="Interview confirmation",
        message=(
            f"Your session for {instance.application.job.title} is confirmed for "
            f"{instance.sheduled_date.strftime('%b %d, %H:%M')}. "
            f"Join link: {instance.meeting_link}"
        )
    )
