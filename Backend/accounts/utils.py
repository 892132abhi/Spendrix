import random
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from .tasks import send_otp_email_task
from django.utils import timezone


def generate_otp():
    return str(random.randint(100000, 999999))


def set_user_otp(user, minutes=1):
    otp = generate_otp()
    user.otp = otp
    user.otp_expiry = timezone.now() + timedelta(minutes=minutes)
    user.save()
    return otp


def send_otp_email(user, otp, minutes=1):
    subject = 'Your Spendrix Verification Code'
    message = f'Hi {user.username},\n\nYour OTP for Spendrix is: {otp}. It expires in {minutes} minutes.'
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    send_mail(subject, message, email_from, recipient_list)


def send_otp(user, minutes=1):
    otp = set_user_otp(user, minutes)
    send_otp_email_task.delay(user.id, otp, minutes)
    send_otp_email(user, otp, minutes)
    
    return otp


def is_otp_expired(user):
    return user.otp_expiry and timezone.now() > user.otp_expiry


def clear_user_otp(user):
    user.otp = None
    user.otp_expiry = None
    user.save()

import pdfplumber


def extract_resume_text(file_path):
    text = ""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    return text.strip()