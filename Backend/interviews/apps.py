from django.apps import AppConfig


class InterviewsConfig(AppConfig):
    name = 'interviews'
    def ready(self):
        import interviews.signals