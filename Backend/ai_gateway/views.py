import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated  # Assures secure token session tracking
from .service import AIServiceClient


class ResumeAnalysisView(APIView):
    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "Resume file required"}, status=status.HTTP_400_BAD_REQUEST)

        result = AIServiceClient.post(
            "/resume/analyze_resume",
            files={"file": (file.name, file, file.content_type)}
        )
        return Response(result)


class JobRecommendationView(APIView):
    def post(self, request):
        result = AIServiceClient.post("/jobs/recommend", json=request.data)
        return Response(result)


class InterviewKitView(APIView):
    def post(self, request):
        result = AIServiceClient.post(
            "/workspace/generate-kit",
            data={
                "filename": request.data.get("filename"),
                "job_description": request.data.get("job_description")
            }
        )
        return Response(result)


class WorkspaceUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "File required"}, status=status.HTTP_400_BAD_REQUEST)

        result = AIServiceClient.post(
            "/workspace/upload",
            files={"file": (file.name, file, file.content_type)}
        )
        return Response(result)


class WorkspaceChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Tie the conversation session key directly to the Django PostgreSQL User ID
        user_session_id = f"user_sess_{request.user.id}"

        result = AIServiceClient.post(
            "/workspace/message",
            data={
                "session_id": user_session_id,
                "message": request.data.get("message"),
                "filename": request.data.get("filename")
            }
        )
        return Response(result)


class WorkspaceHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Fetches history from FastAPI using the authenticated User ID string.
        Note: session_id is no longer needed in the URL path parameters because 
        it is securely pulled right from request.user.
        """
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
        # Extract the file object safely from the request collection
        uploaded_file = request.FILES.get("file") or request.FILES.get("resume")
        
        file_payload = None
        if uploaded_file:
            # 🎯 FIXED: Map the file key name explicitly to "resume" to match FastAPI's parameter name!
            file_payload = {
                "resume": (uploaded_file.name, uploaded_file.read(), uploaded_file.content_type)
            }

        result = AIServiceClient.post(
            "/interview/auto-schedule",
            data={
                "job_title": request.data.get("job_title"),
                "job_skills": request.data.get("job_skills"),
                "job_description": request.data.get("job_description"),
                "interviewers": request.data.get("interviewers") 
            },
            files=file_payload
        )
        return Response(result)