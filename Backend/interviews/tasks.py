from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from .models import InterviewInvitation


@shared_task
def send_interviewer_invitation_email(invitation_id):
    invitation = InterviewInvitation.objects.select_related(
        "interview",
        "interview__application",
        "interview__application__candidate",
        "interview__application__job",
        "invited_by",
    ).get(id=invitation_id)

    interview = invitation.interview
    candidate_name = interview.application.candidate.username
    job_title = interview.application.job.title
    scheduled_time = timezone.localtime(interview.sheduled_date)

    invite_url = f"http://localhost:5173/registerpage?invite_token={invitation.token}"

    message = f"""
    You have been invited as an interviewer on Spendrix.

    Candidate: {candidate_name}
    Job: {job_title}
    Scheduled Date: {scheduled_time.strftime("%d-%m-%Y %I:%M %p")}
    Meeting Link: {interview.meeting_link or "Not provided"}
    Notes: {interview.note or "No notes"}

    Register or login using this invitation link:
    {invite_url}
    """

    send_mail(
        subject="Spendrix Interview Invitation",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[invitation.email],
        fail_silently=False,
    )