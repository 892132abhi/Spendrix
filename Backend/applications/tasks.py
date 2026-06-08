from celery import shared_task

from .models import Application
from jobs.models import Job

import requests


@shared_task
def score_application(application_id):

    app = Application.objects.get(id=application_id)

    if not app.resume:
        return

    job = app.job

    with app.resume.open("rb") as resume_file:

        response = requests.post(
            "http://ai_service:8001/interview/auto-schedule",
            data={
                "job_title": job.title,
                "job_skills": job.skills,
                "job_description": job.description,
                "interviewers": "[]"
            },
            files={
                "resume": (
                    app.resume.name,
                    resume_file,
                    "application/pdf"
                )
            }
        )

    result = response.json()

    app.ai_score = result.get("score", 0)
    app.save(update_fields=["ai_score"])