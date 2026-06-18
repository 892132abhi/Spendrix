from django.shortcuts import render
from rest_framework.views import APIView
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Company
from accounts.models import CustomUser
from .serializers import CompanySerializer
from .utils import send_company_otp, is_company_otp_expired, clear_company_otp

class MyCompanyDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_profile = getattr(request.user, 'profile', None)
        
        # ➔ FIX HERE: Check if the company relation object itself exists
        if not user_profile or not user_profile.company:
            return Response(
                {"detail": "No Company Profile"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            # ➔ FIX HERE: Query using the related object instance directly
            company = user_profile.company
            serializer = CompanySerializer(company)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response(
                {"detail": "Linked company record could not be found in the system."}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request):
        user_profile = getattr(request.user, 'profile', None)
        # ➔ FIX HERE: Check if the company relation object itself exists
        if not user_profile or not user_profile.company:
            return Response(
                {"detail": "No active workspace link found to update."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            company = user_profile.company
            serializer = CompanySerializer(company, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Company.DoesNotExist:
            return Response(
                {"detail": "Target company profile data missing."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class CreateCompanyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        
        if user.role != 'HR':
            return Response(
                {"detail": "Operation restricted to corporate recruiter profiles."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        if getattr(user.profile, 'company_name', None):
            return Response(
                {"detail": "Workspace has already been initialized for this user account."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            company = serializer.save(is_approved=True)
            user_profile = user.profile
            user_profile.company = company
            user_profile.department = "HR"
            user_profile.save()

            
            return Response({
                "message": "Company workspace setup complete!",
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                },
                "company": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendCompanyOtpView(APIView):
    def post(self, request):
        email = request.data.get('email')
        name = request.data.get('name', '').strip()
        
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Determine a safe fallback if the name input field was left empty on the frontend
        fallback_name = name if name else email.split('@')[0]
            
        try:
            # FIXED: Pass the name into defaults so database creation doesn't break integrity constraints
            company, created = Company.objects.get_or_create(
                email=email,
                defaults={'name': fallback_name}
            )
            
            if company.is_verified:
                return Response({"detail": "Company with this email is already verified."}, status=status.HTTP_400_BAD_REQUEST)
            
            # If the company record already existed but its name needs to be updated or initialized
            if name and company.name != name:
                company.name = name
                company.save()
                
            # Trigger your email/OTP utility script functions
            send_company_otp(company, minutes=5)
            
            return Response({"detail": "Verification token sent to your email workspace successfully."}, status=status.HTTP_200_OK)
            
        except Exception as e:
            print("CRITICAL OTP SERVER ERROR:", str(e)) # This prints any unexpected errors directly to your terminal
            return Response({"detail": "Internal server configuration error handling OTP dispatch."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class VerifyCompanyOtpView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        if not email or not otp:
            return Response({"detail": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            company = Company.objects.get(email=email)
            if is_company_otp_expired(company):
                return Response({"detail": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
            if company.otp != otp:
                return Response({"detail": "Invalid OTP. Please try again."}, status=status.HTTP_400_BAD_REQUEST)
            company.is_verified = True
            company.save()
            clear_company_otp(company)
            return Response({"detail": "Company verified successfully."}, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response({"detail": "Company with the provided email does not exist."}, status=status.HTTP_404_NOT_FOUND)


class CompanyListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        companies = Company.objects.filter(is_approved=False).order_by('name')
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class InviteStaffView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        role = request.data.get('role', 'INTERVIEWER')
        company = request.user.profile.company

        if not email:
            return Response({"detail": "Target destination email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Guard check: Make sure they aren't already registered in the system
        if CustomUser.objects.filter(email=email).exists():
            return Response({"detail": "An account profile with this email address already exists."}, status=status.HTTP_400_BAD_REQUEST)
        if not company:
            return Response({"detail":"your profile is not linked to a company"},status=status.HTTP_400_BAD_REQUEST)

        try:
            # 2. Cryptographically seal the payload data (Email + Role mapping)
            signer = TimestampSigner()
            payload = f"{email}:{role}:{company.id}"
            secure_token = signer.sign(payload)

            # 3. ➔ CRITICAL PARAMETER FIX: Changed ?token= to ?invite_token= to match your React searchParams hook exactly!
            invite_link = f"http://localhost/registerpage?invite_token={secure_token}"

            # 4. Dispatch the system email task vector
            subject = f"Invitation to join {getattr(request.user.profile, 'company.name', 'Spendrix Workspace')}"
            message = (
                f"Hello,\n\n"
                f"You have been invited to join the platform workspace as a Technical Interviewer Evaluator.\n"
                f"Please follow the link below to initialize and configure your profile user account:\n\n"
                f"{invite_link}\n\n"
                f"Note: For workspace infrastructure safety, this custom token signature path expires in 48 hours."
            )

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            return Response({"detail": "Permissioned access routing link successfully transmitted."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": f"Failed to safely package invitation delivery payload: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


