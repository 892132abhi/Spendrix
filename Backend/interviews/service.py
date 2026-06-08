import uuid
import json
import requests
import traceback
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from jobs.models import Job
from applications.models import Application
from interviews.models import Interview
from django.core.mail import send_mail
from django.conf import settings
User = get_user_model()

AI_SERVICE_URL = "http://ai_service:8001/interview/auto-schedule"


def run_ai_interview_scheduler(job_id, hr_user):
    try:
        job = Job.objects.get(id=job_id)

    except Job.DoesNotExist:
        return {
            "error": f"Job posting with ID {job_id} not found."
        }

    pending_apps = (
        Application.objects
        .filter(
            job=job,
            status="APPLIED"
        )
        .select_related("candidate")
    )

    if not pending_apps.exists():
        return {
            "message": "No new APPLIED candidates found."
        }

    interviewers_queryset = User.objects.filter(
        role="INTERVIEWER",
        profile__company=hr_user.profile.company
    )

    if not interviewers_queryset.exists():
        return {
            "error": "No interviewers available."
        }

    interviewers_payload = []

    for inv in interviewers_queryset:

        workload = Interview.objects.filter(
            interviewer=inv,
            status="SHEDULED"
        ).count()

        interviewers_payload.append({
            "id": inv.id,
            "username": inv.username,
            "skills": getattr(getattr(inv, "profile", None), "skills", ""),
            "current_interviews": workload
        })

    ranked_candidates = []

    # --------------------------------------------------
    # STEP 1: Analyze all resumes
    # --------------------------------------------------

    for app in pending_apps:

        resume_file_obj=(
                app.resume
            or app.candidate.profile.resume
        )
        if not resume_file_obj:
            print(f" no resume for candidate{app.candidate.username}")
            continue

        try:

            with resume_file_obj.open("rb") as resume_file:

                form_data = {
                    "job_title": job.title,
                    "job_skills": job.skills,
                    "job_description": job.description,
                    "interviewers": json.dumps(
                        interviewers_payload
                    )
                }

                files = {
                    "resume": (
                        resume_file_obj.name,
                        resume_file,
                        "application/pdf"
                    )
                }

                response = requests.post(
                    AI_SERVICE_URL,
                    data=form_data,
                    files=files,
                    timeout=60
                )

                response.raise_for_status()

                ai_data = response.json()
                score = ai_data.get("score", 0)
                print("================================")
                print("Candidate:", app.candidate.username)
                print("AI Response:", ai_data)
                print("Score:", score)
                print("Is Match:", ai_data.get("is_match"))
                print("================================")


                # Save AI score
                app.ai_score = score
                app.save(update_fields=["ai_score"])

                if not ai_data.get("is_match"):
                    app.interview_status = (
                         "Rejected by AI screening")
                    app.save(update_fields=["interview_status"])
                    continue

                ranked_candidates.append({
                    "application": app,
                    "score": score,
                    "assigned_interviewer_id":
                        ai_data.get(
                            "assigned_interviewer_id"
                        ),
                    "reason":
                        ai_data.get(
                            "reason",
                            "AI recommendation"
                        )
                })

        except Exception as exc:

            print(
                f"Failed processing "
                f"application {app.id}: {exc}"
            )

            continue

    # --------------------------------------------------
    # STEP 2: Rank candidates
    # --------------------------------------------------

    ranked_candidates.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    TOP_CANDIDATES = min(
        5,
        len(ranked_candidates)
    )

    selected_candidates = (
        ranked_candidates[:TOP_CANDIDATES]
    )

    # --------------------------------------------------
    # STEP 3: Schedule interviews
    # --------------------------------------------------

    interviews_booked = 0

    base_date = (
        timezone.now() +
        timezone.timedelta(days=2)
    )

    current_time_slot = base_date.replace(
        hour=10,
        minute=0,
        second=0,
        microsecond=0
    )

    for candidate_data in selected_candidates:

        app = candidate_data["application"]

        # Prevent duplicates
        if Interview.objects.filter(
            application=app
        ).exists():
            continue

        interviewer_id = (
            candidate_data[
                "assigned_interviewer_id"
            ]
        )

        if not interviewer_id:
            continue

        try:

            interviewer = User.objects.get(
                id=interviewer_id
            )

        except User.DoesNotExist:
            continue

        staggered_time = (
            current_time_slot +
            timezone.timedelta(
                minutes=interviews_booked * 90
            )
        )

        try:
            print(
                "Trying to create interview for:",
                app.candidate.username
            )
            print(
                "Assigned interviewer:",
                interviewer_id
            )
            with transaction.atomic():

                interview = Interview.objects.create(
                    application=app,
                    interviewer=interviewer,
                    hr_name=hr_user,
                    sheduled_date=staggered_time,
                    note=candidate_data["reason"],
                    meeting_link=(
                        f"https://meet.jit.si/"
                        f"spendrix-interview-"
                        f"{app.id}-"
                        f"{uuid.uuid4().hex[:4]}"
                    ),
                    status="SHEDULED"
                )
                send_mail(
                    subject="interview scheduled",
                    message=f"""
                hello {app.candidate.username},
                you have been short listed

                interview date:
                {staggered_time}

                    meeting link:
                    {interview.meeting_link}

                    best regards,
                    Spendrix
                        """,
                
                from_email = settings.DEFAULT_FROM_EMAIL,
                recipient_list=[app.candidate.email],
                fail_silently = False
                )
                print("INTERVIEW CREATED:", interview.id)
                app.status = "INTERVIEW"
                app.interview_status = ("Interview Scheduled")
                app.save(
                    update_fields=["status","interview_status"]
                )

                interviews_booked += 1

        except Exception as exc:

            print(
                f"Interview creation failed "
                f"for application "
                f"{app.id}: {exc}"
            )
            traceback.print_exc()

    return {
        "message":
            f"AI scheduling completed. "
            f"{interviews_booked} interviews created.",
        "ranked_candidates":
            len(ranked_candidates),
        "scheduled":
            interviews_booked
    }