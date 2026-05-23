from django.urls import path
from .models import Job
from .import views
urlpatterns=[
    path('joblist/',views.JobList.as_view(),name='job-list'),
    path('createjob/',views.JobCreation.as_view(),name='create-job'),
    path('availablejob/',views.AvailableJob.as_view(),name='available-job'),
    path('deletejob/<int:id>/',views.JobDeletion.as_view(),name='delete-job'),
    path('singlejoblist/<int:id>/',views.SingleJobList.as_view(),name='singlejob-list'),
    path('editjob/<int:id>/',views.EditJob.as_view(),name='edit-job'),
    path('statusupdate/<int:id>/',views.JobStatus.as_view(),name='jobstatus-update'),
    path('jobcount/',views.JobCount.as_view(),name='job-count'),
]