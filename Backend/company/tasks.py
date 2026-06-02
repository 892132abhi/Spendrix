# Backend/company/tasks.py
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_company_otp_email_task(company_email, company_name, otp, minutes=5):
    subject = "Your Spendrix Company Verification Code"
    message = (
        f"Hi {company_name},\n\n"
        f"Your company verification OTP is: {otp}. "
        f"It expires in {minutes} minutes."
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [company_email],
        fail_silently=False,
    )