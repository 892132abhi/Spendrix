from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Company
from .serializers import CompanySerializer

class CompanyListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        companies = Company.objects.filter(is_approved=True).order_by('name')
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class InitializeCompanyWorkspaceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user
        
        
        if user.role != 'HR':
            return Response(
                {"detail": "Operation restricted to corporate recruiter profiles."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        
        if user.profile.company_name:
            return Response(
                {"detail": "Workspace has already been initialized for this user account."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
             
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            
            company = serializer.save(is_approved=True)
            
           
            user_profile = user.profile
            user_profile.company_name = company.name
            
            
            user_profile.department = "Recruitment & HR"
            user_profile.save()
            
            return Response({
                "message": "Company workspace setup complete!",
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                },
                "company": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)