from django.urls import path
from . import views

urlpatterns = [
    path("resume/", views.ResumeAnalysisView.as_view()),
    path("jobs/", views.JobRecommendationView.as_view()),
    path("rag/interview-kit/", views.InterviewKitView.as_view()),
    path("workspace/upload/", views.WorkspaceUploadView.as_view()),
    
    # ── UPDATED CHAT ROUTE (Matches your React /workspace/chat/ action) ──
    path("workspace/chat/", views.WorkspaceChatView.as_view()),
    
    # ── NEW HISTORY RECOVERY VIEW BRIDGE ──
    path("workspace/history/<str:session_id>/", views.WorkspaceHistoryView.as_view()),
    path("interview/auto-schedule/", views.AIAutoScheduleView.as_view(), name="gateway-auto-schedule"),
]