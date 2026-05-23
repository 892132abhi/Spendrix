from django.urls import path
# Fix the typo on line 2:
from . import views  

urlpatterns = [
    path('', views.CompanyListCreateView.as_view(), name='company-list-create'),
    path('initialize-workspace/', views.InitializeCompanyWorkspaceView.as_view(), name='initialize-workspace'),
]