import requests
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from .models import Profile
from jobs.models import Job
User = get_user_model()


@shared_task
def send_otp_email_task(user_id, otp, minutes=1):
    user = User.objects.get(id=user_id)

    subject = "Your Spendrix Verification Code"
    message = f"Hi {user.username},\n\nYour OTP for Spendrix is: {otp}. It expires in {minutes} minutes."

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

@shared_task
def send_job_recommendations_email(profile_id):
    profile = Profile.objects.select_related("user").get(id=profile_id)

    if not profile.resume_text:
        return "No resume text found."

    jobs = Job.objects.filter(job_status="OPEN").select_related("company")

    job_payload = []

    for job in jobs:
        job_payload.append({
            "id": job.id,
            "title": job.title,
            "company": job.company.name if job.company else "",
            "skills": job.skills,
            "description": job.description,
            "location": job.location,
            "experience": job.experience,
            "job_type": job.job_type,
            "job_mode": job.job_mode,
        })

    if not job_payload:
        return "No open jobs found."

    response = requests.post(
        "http://ai_service:8001/jobs/recommend",
        json={
            "resume_text": profile.resume_text,
            "candidate_skills": profile.skills or "",
            "jobs": job_payload,
        },
        timeout=60,
    )

    response.raise_for_status()

    recommendations = response.json().get("recommendations", [])

    if not recommendations:
        return "No recommendations found."

    job_map = {job["id"]: job for job in job_payload}

    lines = [
        f"Hi {profile.user.username},",
        "",
        "Here are your AI job recommendations:",
        "",
    ]

    for index, rec in enumerate(recommendations, start=1):
        job = job_map.get(rec.get("job_id"))

        if not job:
            continue

        lines.extend([
            f"{index}. {job['title']} - {job['company']}",
            f"Score: {rec.get('score', 0)}%",
            f"Location: {job['location']}",
            f"Reason: {rec.get('reason', '')}",
            f"Matching Skills: {', '.join(rec.get('matching_skills', []))}",
            f"Missing Skills: {', '.join(rec.get('missing_skills', []))}",
            "",
        ])

    lines.extend([
        "Login to Spendrix to view and apply.",
        "",
        "Regards,",
        "Spendrix",
    ])

    send_mail(
        subject="Your AI Job Recommendations",
        message="\n".join(lines),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[profile.user.email],
        fail_silently=False,
    )

    return "Recommendation email sent."


@shared_task
def send_scheduled_job_recommendations():
    profiles = Profile.objects.select_related("user").filter(
        user__role="CANDIDATE",
        user__is_active=True,
        resume_text__isnull=False,
    ).exclude(resume_text="")

    count = 0

    for profile in profiles:
        send_job_recommendations_email.delay(profile.id)
        count += 1

    return f"Queued recommendation emails for {count} candidates."