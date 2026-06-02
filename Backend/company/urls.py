from django.urls import path
from . import views  

urlpatterns = [
    path('', views.CompanyListCreateView.as_view(), name='company-list-create'),
    path('send-company-otp/', views.SendCompanyOtpView.as_view(), name='send-company-otp'),
    path('verify-company-otp/', views.VerifyCompanyOtpView.as_view(), name='verify-company-otp'),
    path('create-company/', views.CreateCompanyView.as_view(), name='create-company'),
    path('my-company/', views.MyCompanyDetailView.as_view(), name='my-company-detail'),
    path('invite-staff/', views.InviteStaffView.as_view(), name='invite-staff'),
]