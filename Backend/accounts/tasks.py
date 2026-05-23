from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model

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