from rest_framework import serializers
from .models import Interview, InterviewInvitation
from applications.models import Application
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import transaction
from .tasks import send_interviewer_invitation_email

User = get_user_model()


class InterviewSerializer(serializers.ModelSerializer):
    interviewer_name = serializers.SerializerMethodField()
    interviewer_email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    candidate_id = serializers.IntegerField(source='application.candidate.id', read_only=True)
    candidate_name = serializers.CharField(source='application.candidate.username', read_only=True)
    hr_id = serializers.IntegerField(source='hr_name.id', read_only=True)
    interviewer_id = serializers.IntegerField(source='interviewer.id', read_only=True)

    class Meta:
        model = Interview
        fields = [
            'id',
            'application',
            'candidate_id',
            'hr_id',
            'interviewer',
            'interviewer_id',
            'interviewer_email',
            'interviewer_name',
            'candidate_name',
            'sheduled_date',
            'note',
            'meeting_link',
            'status',
            'created_at'
        ]

    def get_interviewer_name(self, obj):
        if obj.interviewer and hasattr(obj.interviewer, "profile"):
            return obj.interviewer.profile.full_name
        invitation = obj.invitations.order_by('-created_at').first()
        if invitation:
            return invitation.email
        return "Pending invitation"

    def validate_sheduled_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("This date is not available")
        return value

    def validate(self, data):
        interviewer = data.get("interviewer")
        interviewer_email = data.get("interviewer_email")

        if not interviewer and not interviewer_email:
            raise serializers.ValidationError({
                "interviewer": "Select an interviewer or enter interviewer email."
            })

        if interviewer and interviewer_email:
            raise serializers.ValidationError({
                "interviewer_email": "Use either existing interviewer or email, not both."
            })

        return data

    def create(self, validated_data):
        interviewer_email = validated_data.pop("interviewer_email", None)
        request = self.context.get("request")

        interview = Interview.objects.create(**validated_data)

        if interviewer_email:
            invitation = InterviewInvitation.objects.create(
                email=interviewer_email,
                interview=interview,
                invited_by=request.user if request else None
            )
            transaction.on_commit(
                lambda:send_interviewer_invitation_email.delay(invitation.id)
            )
        return interview


class InterViewerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    email = serializers.EmailField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email']


class ApplicationLookUpSerializer(serializers.ModelSerializer):
    candidate_username = serializers.CharField(source='candidate.username', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'candidate_username', 'job_title']


class AssignedInterviewCandidateSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(source='application.candidate.profile.profile_pic', read_only=True)
    name = serializers.CharField(source='application.candidate.profile.full_name', read_only=True)
    email = serializers.CharField(source='application.candidate.email', read_only=True)
    role = serializers.CharField(source='application.job.title', read_only=True)
    phone = serializers.CharField(source='application.candidate.profile.phone_number', read_only=True)
    skills = serializers.CharField(source='application.candidate.profile.skills', read_only=True)
    experience_years = serializers.IntegerField(source='application.candidate.profile.experience_years', read_only=True)
    bio = serializers.CharField(source='application.candidate.profile.bio', read_only=True)
    resume = serializers.FileField(source='application.candidate.profile.resume', read_only=True)
    recruiter_name = serializers.CharField(source='hr_name.profile.full_name', read_only=True)
    hr_id = serializers.IntegerField(source='hr_name.id', read_only=True)

    class Meta:
        model = Interview
        fields = [
            'id',
            'hr_id',
            'name',
            'email',
            'role',
            'skills',
            'status',
            'sheduled_date',
            'phone',
            'experience_years',
            'meeting_link',
            'bio',
            'profile_pic',
            'resume',
            'strength',
            'weakness',
            'decision_note',
            'recruiter_name'
        ]


class CandidateInterviewSerializer(serializers.ModelSerializer):
    hr_id = serializers.IntegerField(source='hr_name.id', read_only=True)
    interviewer_name = serializers.SerializerMethodField()
    job_title = serializers.CharField(source='application.job.title', read_only=True)

    class Meta:
        model = Interview
        fields = ['id', 'hr_id', 'job_title', 'interviewer_name', 'sheduled_date', 'meeting_link', 'status']

    def get_interviewer_name(self, obj):
        if obj.interviewer and hasattr(obj.interviewer, "profile"):
            return obj.interviewer.profile.full_name
        invitation = obj.invitations.order_by('-created_at').first()
        if invitation:
            return invitation.email
        return "Pending invitation"
