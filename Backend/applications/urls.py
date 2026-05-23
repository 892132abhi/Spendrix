from django.urls import path
from .import views
urlpatterns=[
    path('applyjob/<int:id>/',views.ApplyJob.as_view(),name='apply-job'),
    path('applicationlist/',views.ApplicationList.as_view(),name='application-list'),
    path('jobapplicationslist/',views.JobApplicantList.as_view(),name='job-application-list'),
    path('appicationcount/',views.ApplicationCount.as_view(),name='application-count'),
]