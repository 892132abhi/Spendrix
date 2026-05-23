from django.urls import path
from .import views
urlpatterns=[
    path('createinterview/',views.InterviewCreateView.as_view(),name='create-interview'),
    path('lookups/interviewers/',views.InterViewerLookUp.as_view(),name='find-interviewers'),
    path('lookups/applications/',views.AppilcationLookUp.as_view(),name='find-applications'),
    path('interviewlist/',views.InterviewList.as_view(),name='interview-list'),
    path('interviewcount/',views.InterviewCount.as_view(),name='interview-count'),
    path('interviewer-status/',views.InterviewStatusCount.as_view(),name='interview-status'),
    path('assignedcandidatelist/',views.AssignedCandidateListView.as_view(),name='assigned-candidate-list'),
    path('assignedinterviews/',views.AssignedInterviews.as_view(),name='assigned-interviews'),
    path('candidateinterviews/',views.CandidateInterview.as_view(),name='candidate-interviews'),
    path('candidate/<int:id>/assessment/',views.CandidateNoteupdates.as_view(),name='candidate-assessment'),
    path('candidate/<int:id>/decision/',views.CandidateDecisionUpdate.as_view(),name='candidate-decision'),
]   
