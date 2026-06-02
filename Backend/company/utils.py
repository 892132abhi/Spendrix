import random
from datetime import timedelta
from django.utils import timezone

# REMOVED: from .tasks import send_company_otp_email_task <--- Delete this from the top!

def generate_company_otp():
    return str(random.randint(100000, 999999))

def set_company_otp(company, minutes=5):
    otp = generate_company_otp()
    company.otp = otp
    company.otp_expiry = timezone.now() + timedelta(minutes=minutes)
    company.save()
    return otp

def send_company_otp(company, minutes=5):
    otp = set_company_otp(company, minutes)
    
    # MOVE THE IMPORT HERE to break the circular dependency loop
    from .tasks import send_company_otp_email_task 
    
    send_company_otp_email_task.delay(
        company_email=company.email,
        company_name=company.name,
        otp=otp,
        minutes=minutes
    )
    return otp

def is_company_otp_expired(company):
    return company.otp_expiry and timezone.now() > company.otp_expiry

def clear_company_otp(company):
    company.otp = None
    company.otp_expiry = None
    company.save()