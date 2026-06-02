from django.urls import path

from .views import ChatHistoryView, GetOrCreateChatRoom

urlpatterns = [
    path("room/", GetOrCreateChatRoom.as_view(), name="get-or-create-room"),
    path("history/<uuid:room_id>/", ChatHistoryView.as_view(), name="chat-history"),
]
