from django.urls import path
from .import views
urlpatterns=[
    path('chatview/<str:room_type>/<str:interview_id>/',views.ChatView.as_view(),name='chat-view')
]
