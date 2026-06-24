from django.urls import path
from . import views

urlpatterns = [
    path("resume/", views.ResumeAnalysisView.as_view()),
    path("jobs/", views.JobRecommendationView.as_view()),
    path("rag/interview-kit/", views.InterviewKitView.as_view()),
    path("workspace/upload/", views.WorkspaceUploadView.as_view()),
    path("workspace/chat/", views.WorkspaceChatView.as_view()),
    path("workspace/history/<str:session_id>/", views.WorkspaceHistoryView.as_view()),
    path("interview/auto-schedule/", views.AIAutoScheduleView.as_view(), name="gateway-auto-schedule"),
    path("jobs/generate-jd/", views.JDGeneratorView.as_view(), name="gateway-generate-jd"),
]