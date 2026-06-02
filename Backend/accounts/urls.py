from django.urls import path
from .import views
from rest_framework_simplejwt.views import TokenRefreshView
urlpatterns=[
    path('register/',views.RegisterView.as_view(),name='register-page'),
    path('request-otp/',views.RequestOTPView.as_view(), name='request-otp'),
    path('verify-otp/',views.VerifyOTPView.as_view(), name='verify-otp'),
    path('login/',views.LoginView.as_view(),name='login'),
    path('validate-invite/', views.ValidateInvitationTokenView.as_view(), name='validate-invite'),
    path('password-reset/request-otp/', views.RequestPasswordResetOTPView.as_view(), name='password-reset-request-otp'),
    path('password-reset/verify-otp/', views.VerifyPasswordResetOTPView.as_view(), name='password-reset-verify-otp'),
    path('set-new-password/', views.SetNewPasswordView.as_view(), name='set-new-password'),
    path('token/refresh/',views.CookieTokenRefreshView.as_view(),name='token_refresh'),
    path('google/', views.GoogleLoginView.as_view(), name='google-login'),
    path('profile/',views.ProfileView.as_view(),name='profile-view'),
    path('profileupdate/',views.ProfileUpdateView.as_view(),name='profile-update'),
    path('profiledata/',views.ProfileCount.as_view(),name='profile-data'),
    path('profilelist/',views.ProfileListView.as_view(),name='profile-list'),
    path('staffstatus/<int:id>/',views.UserStatusToggleView.as_view(),name='manage-status'),
    path('account-delete/<int:id>/',views.DeleteAccount.as_view(),name='account-delete'),
    path('logout/',views.Logoutview.as_view(),name='logout')
]
