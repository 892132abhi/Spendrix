from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile
from interviews.models import InterviewInvitation

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    invite_token = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'role','invite_token']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"message": "Password Do not Match"})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        invite_token = validated_data.pop('invite_token', None)
        requested_role = validated_data.pop('role', 'CANDIDATE')

        role = requested_role
        invitation = None

        if invite_token:
            invitation = InterviewInvitation.objects.filter(token=invite_token).first()

            if not invitation or not invitation.is_valid():
                raise serializers.ValidationError({
                    "invite_token": "Invalid or expired invitation."
                })

            if invitation.email.lower() != validated_data.get("email").lower():
                raise serializers.ValidationError({
                    "email": "This invitation was sent to a different email."
                })

            role = 'INTERVIEWER'

        user = User.objects.create_user(role=role, **validated_data)

        if invitation:
            invitation.is_accepted = True
            invitation.save()

            if invitation.interview:
                invitation.interview.interviewer = user
                invitation.interview.save()

        return user
    
class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id',
            'is_active',
            'user_id',
            'role',
            'username',
            'full_name',
            'first_name',
            'skills',
            'last_name',
            'email',
            'phone_number',
            'bio',
            'experience_years',
            'company_name',
            'resume',
            'department',
            'linked_in',
            'profile_pic'
        ]