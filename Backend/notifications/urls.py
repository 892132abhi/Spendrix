from django.urls import path
from . import views

urlpatterns=[
    path('notificationslist/',views.NotificationView.as_view(),name='notification-list'),
    path('notificationupdate/<int:id>/',views.NotificationUpdate.as_view(),name='notification-update'),
    path('save-fcm-token/',views.SaveFCMTokenView.as_view(),name='save-fcm-token'),
]