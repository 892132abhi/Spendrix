import requests
from django.db.models import Q
from google.auth.transport import requests as google_requests
from django.utils import timezone
from django.contrib.auth import login, authenticate
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CustomUser, Profile
from jobs.models import Job
from .serializers import RegisterSerializer, ProfileSerializer
from .utils import send_otp, is_otp_expired, clear_user_otp
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

# NEW IMPORT: For managing secure temporary signature tokens safely
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature

User = get_user_model()

def set_auth_cookies(response, user):
    """
    Standardizes how JWT cookies are set across all login methods.
    """
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    response.set_cookie(
        key=settings.SIMPLE_JWT['AUTH_COOKIE'],
        value=access_token,
        httponly=True,
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
        path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
    )

    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,
        secure=False,
        samesite='Lax',
        path='/api/accounts/token/refresh/',
    )
    return response


# =========================================================================
# NEW VIEW: Validates invitation token for frontend mount checks
# =========================================================================
class ValidateInvitationTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        token = request.query_params.get('token')
        if not token:
            return Response({"valid": False, "detail": "Missing invitation configuration parameters."}, status=status.HTTP_400_BAD_REQUEST)

        signer = TimestampSigner()
        try:
            # Token signature strictly expires after 48 hours (172800 seconds)
            decrypted_payload = signer.unsign(token, max_age=172800)
            email, role = decrypted_payload.split(":")
            
            return Response({
                "valid": True,
                "email": email,
                "role": role
            }, status=status.HTTP_200_OK)

        except SignatureExpired:
            return Response({"valid": False, "detail": "This platform invitation token link has expired."}, status=status.HTTP_400_BAD_REQUEST)
        except (BadSignature, ValueError):
            return Response({"valid": False, "detail": "Cryptographic registration signature verification failed."}, status=status.HTTP_400_BAD_REQUEST)


# =========================================================================
# UPDATED VIEW: Supports token parsing and strict role injection
# =========================================================================
class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        # Clean out stale unverified junk account profiles
        CustomUser.objects.filter(
            is_email_verified=False,
            otp_expiry__lt=timezone.now()
        ).delete()

        invite_token = request.data.get('invite_token')
        assigned_role = None
        invited_company_id = None

        # 1. Server-side token validation checkpoint
        if invite_token:
            signer = TimestampSigner()
            try:
                decrypted_payload = signer.unsign(invite_token, max_age=172800)
                token_email, token_role ,token_company_id=decrypted_payload.split(":")
                
                # Enforce that the provided registration email matches the token target address precisely
                if request.data.get('email', '').strip().lower() != token_email:
                    return Response({"email": ["Email address mismatch against authorized invitation parameters."]}, status=status.HTTP_400_BAD_REQUEST)
                
                assigned_role = token_role # Safely assigns 'INTERVIEWER' from the signed payload
                invited_company_id = token_company_id
                
            except (SignatureExpired, BadSignature, ValueError):
                return Response({"detail": "The invitation secure key signature handle is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Run your standard serialization configurations
        data = request.data.copy()
        data.pop('invite_token', None)

        if assigned_role:
            data['role'] = assigned_role

        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            
            # If an explicit role was securely decrypted, overwrite serializer default fields directly
            if assigned_role:
                user.role = assigned_role
            if invited_company_id:
                user.profile.company_id = invited_company_id
                user.profile.department = "INTERVIEWER"
                user.profile.save()
            user.is_email_verified = False
            user.is_active = False
            user.save()

            try:
                send_otp(user)
                msg = "Registered successfully. OTP sent to email."
            except Exception as e:
                msg = f"Registered successfully, but email failed: {str(e)}"

            return Response({"message": msg}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RequestOTPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        username = request.data.get('username')
        is_resend = request.data.get('resend', False)

        if is_resend:
            user = CustomUser.objects.filter(username=username).first()
        else:
            password = request.data.get('password')
            user = authenticate(username=username, password=password)

        if user:
            send_otp(user)
            return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        otp_received = request.data.get('otp')

        user = CustomUser.objects.filter(username=username).first()
        if not user:
            return Response({"detail": "User not found!"}, status=status.HTTP_400_BAD_REQUEST)

        if is_otp_expired(user):
            if not user.is_email_verified:
                user.delete()
                return Response({"detail": "OTP expired. Account removed."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"detail": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_otp_valid() and user.otp == otp_received:
            clear_user_otp(user)
            user.is_email_verified = True
            user.is_active = True
            user.save()

            login(request, user)
            response = Response({
                "message": "Login Successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                }
            }, status=status.HTTP_200_OK)

            return set_auth_cookies(response, user)

        return Response({"detail": "Invalid or expired OTP"}, status=status.HTTP_401_UNAUTHORIZED)


class RequestPasswordResetOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        user = CustomUser.objects.filter(email=email).first()
        if user and user.is_active:
            send_otp(user)
            return Response({"message": "Reset OTP sent to your email."}, status=status.HTTP_200_OK)
        return Response({"detail": "No active account found with this email."}, status=status.HTTP_404_NOT_FOUND)


class VerifyPasswordResetOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp_received = request.data.get('otp')
        user = CustomUser.objects.filter(email=email).first()

        if user and user.is_otp_valid() and user.otp == otp_received:
            return Response({"message": "OTP verified"}, status=status.HTTP_200_OK)
        return Response({"detail": "Invalid or expired OTP"}, status=status.HTTP_401_UNAUTHORIZED)


class SetNewPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')
        user = CustomUser.objects.filter(email=email).first()

        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()
        clear_user_otp(user)
        return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is not None:
            if not user.is_email_verified and user.is_active:
                return Response({"detail": "Please verify your email."}, status=status.HTTP_403_FORBIDDEN)

            login(request, user)
            response = Response({
                "message": "Login Successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                }
            }, status=status.HTTP_200_OK)

            return set_auth_cookies(response, user)
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            request.data['refresh'] = refresh_token

        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                response.set_cookie(
                    key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                    value=response.data['access'],
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                    path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
                )
            return response

        except Exception as e:
            print(f"DEBUG: Prevented 500 error loop. Token validation error: {str(e)}")
            error_response = Response(
                {"detail": "Stale session. Please login again."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            error_response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'], path='/')
            error_response.delete_cookie('refresh_token', path='/api/accounts/token/refresh/')
            return error_response


class Logoutview(APIView):
    def post(self, request):
        response = Response({"message": "successfully logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'], path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'))
        response.delete_cookie('refresh_token', path='/api/accounts/token/refresh/')
        return response


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"detail": "Token required"}, status=400)

        google_res = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo", 
            params={'access_token': token}
        )
        if not google_res.ok:
            return Response({"detail": "Invalid Google token or expired session"}, status=400)

        data = google_res.json()
        email = data.get('email')
        if not email:
            return Response({"detail": "Google account email not found"}, status=400)

        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0],
                "is_email_verified": True,
                "is_active": True,
            }
        )
        if created:
            user.set_unusable_password()
            user.save()
            
        if not user.is_active:
            user.is_email_verified = True
            user.save()

        login(request, user)
        response = Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            },
            "is_new": created
        }, status=200)

        return set_auth_cookies(response, user)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({"detail": "User not exist"}, status=status.HTTP_404_NOT_FOUND)


class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def patch(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileCount(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        Total_user = CustomUser.objects.count()
        Total_admin = CustomUser.objects.filter(role='HR').count()
        Total_Interviewer = CustomUser.objects.filter(role='INTERVIEWER').count()
        Total_candidates = CustomUser.objects.filter(role='CANDIDATE').count()
        Total_jobs = Job.objects.count()
        
        return Response({
            "Total_user": Total_user,
            "Total_admin": Total_admin,
            "Total_Interviewer": Total_Interviewer,
            "Total_candidates": Total_candidates,
            "Total_jobs": Total_jobs
        }, status=status.HTTP_200_OK)


class ProfileListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        search_item = request.query_params.get('search')
        role_type = request.query_params.get('role_type')
        profile_list = Profile.objects.all()
        
        if search_item and search_item.strip():
            profile_list = profile_list.filter(
                Q(user__username__icontains=search_item) |
                Q(user__role__icontains=search_item)
            )
            
        if role_type and role_type != 'ALL':
            profile_list = profile_list.filter(user__role=role_type)
            
        serializer = ProfileSerializer(profile_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserStatusToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        is_active = request.data.get("is_active")
        if is_active is None:
            return Response({"message": "is_active field required"}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = is_active
        user.save()

        action = "activated" if user.is_active else "blocked"
        return Response(
            {
                "message": f"User {action} successfully",
                "is_active": user.is_active
            },
            status=status.HTTP_200_OK
        )
        
        
class DeleteAccount(APIView):
    permission_classes=[IsAuthenticated]
    def delete(self,request,id):
        profile = Profile.objects.get(id=id)
        user=profile.user
        if user:
            user.delete()
            return Response({"detail":"account deleted successfully..."},status=status.HTTP_200_OK)
        return Response({"detail":"user not found..."},status=status.HTTP_404_NOT_FOUND)