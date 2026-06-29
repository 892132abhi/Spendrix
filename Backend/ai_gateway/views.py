import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .service import AIServiceClient
from rest_framework.parsers import MultiPartParser, FormParser


class ResumeAnalysisView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "Resume file required"}, status=status.HTTP_400_BAD_REQUEST)

        result, status_code = AIServiceClient.post(
            "/resume/analyze_resume",
            files={"file": (file.name, file, file.content_type)}
        )
        return Response(result, status=status_code)


class JobRecommendationView(APIView):
    def post(self, request):
        result, status_code = AIServiceClient.post("/jobs/recommend", json=request.data)
        return Response(result, status=status_code)


class InterviewKitView(APIView):
    def post(self, request):
        result, status_code = AIServiceClient.post(
            "/workspace/generate-kit",
            data={
                "filename": request.data.get("filename"),
                "job_description": request.data.get("job_description")
            }
        )
        return Response(result, status=status_code)


class WorkspaceUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "File required"}, status=status.HTTP_400_BAD_REQUEST)

        result, status_code = AIServiceClient.post(
            "/workspace/upload",
            files={"file": (file.name, file, file.content_type)}
        )
        return Response(result, status=status_code)


class WorkspaceChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_session_id = f"user_sess_{request.user.id}"

        result, status_code = AIServiceClient.post(
            "/workspace/message",
            data={
                "session_id": user_session_id,
                "message": request.data.get("message"),
                "filename": request.data.get("filename")
            }
        )
        return Response(result, status=status_code)


class WorkspaceHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_session_id = f"user_sess_{request.user.id}"
        try:
            response = requests.get(
                f"{settings.AI_SERVICE_URL}/workspace/history/{user_session_id}",
                timeout=120
            )
            response.raise_for_status()
            return Response(response.json())
        except requests.exceptions.RequestException as e:
            return Response(
                {"error": f"Failed to sync memory layers: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AIAutoScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get("file") or request.FILES.get("resume")

        file_payload = None
        if uploaded_file:
            file_payload = {
                "resume": (uploaded_file.name, uploaded_file.read(), uploaded_file.content_type)
            }

        result, status_code = AIServiceClient.post(
            "/interview/auto-schedule",
            data={
                "job_title": request.data.get("job_title"),
                "job_skills": request.data.get("job_skills"),
                "job_description": request.data.get("job_description"),
                "interviewers": request.data.get("interviewers")
            },
            files=file_payload
        )
        return Response(result, status=status_code)


class JDGeneratorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'HR':
            return Response(
                {"detail": "Access Denied: Only HR can generate job descriptions."},
                status=status.HTTP_403_FORBIDDEN
            )

        required = ["title", "job_type", "experience", "skills"]
        missing = [f for f in required if not request.data.get(f)]
        if missing:
            return Response(
                {"error": f"Missing fields: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        company_name = None
        if hasattr(request.user, 'profile') and request.user.profile.company:
            company_name = request.user.profile.company.name

        result, status_code = AIServiceClient.post(
            "/jobs/jd/generate",
            json={
                "title": request.data.get("title"),
                "job_type": request.data.get("job_type"),
                "experience": request.data.get("experience"),
                "Qualification": request.data.get("Qualification"),
                "skills": request.data.get("skills"),
                "location": request.data.get("location"),
                "company_name": company_name,
            }
        )
        return Response(result, status=status_code)