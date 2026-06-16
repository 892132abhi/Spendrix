from celery import shared_task
from django.utils import timezone

from jobs.models import Job
from interviews.service import run_ai_interview_scheduler


@shared_task
def process_expired_jobs():

    print(
        "\n===== Checking Expired Jobs ====="
    )

    expired_jobs = Job.objects.filter(
        expires_at__lte=timezone.now(),
        ai_processed=False,
        job_status="OPEN"
    )

    print(
        f"Expired Jobs Found: {expired_jobs.count()}"
    )

    for job in expired_jobs:

        print(
            f"Processing Job: {job.title}"
        )

        result = run_ai_interview_scheduler(
            job_id=job.id,
            hr_user=job.created_by
        )

        print(result)
        if "error" not in result:
            job.ai_processed = True
            job.job_status = "CLOSED"

            
            job.save(
            update_fields=[
                "ai_processed",
                "job_status"
            ]
        )
        else:
            print(f"skipping job update for {job.title} due to scheduler failure : {result.get('error')}")
           
    print(
        "===== Completed =====\n"
    )