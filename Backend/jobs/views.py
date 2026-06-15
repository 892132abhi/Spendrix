from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Job
from company.models import Company
from .serializer import JobSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from datetime import timedelta

# Create your views here.

def get_active_jobs_queryset():
    return Job.objects.filter(
        job_status='OPEN',
        expires_at__gt=timezone.now()
    )

class SingleJobList(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, id):
        try:
            # FIXED: Querying Job.objects directly instead of active helper
            # This ensures CLOSED or expired jobs don't crash with a 404 on the edit page
            job = Job.objects.get(id=id)
            serializer = JobSerializer(job)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Job.DoesNotExist:
            return Response({"detail": "Job not Exist"}, status=status.HTTP_404_NOT_FOUND)

class AvailablePagination(PageNumberPagination):
    page_size = 8
    page_query_param = 'page'
    page_size_query_param = 'page_size'
    max_page_size = 50

class JobList(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        search_item = request.query_params.get('search', None)
        job_types = request.query_params.get('type', None)
        
        jobs = Job.objects.all().order_by('-id')
        
        if search_item and search_item.strip():
            jobs = jobs.filter(
                Q(title__icontains=search_item) |
                Q(location__icontains=search_item)
            )
        
        if job_types and job_types.strip():
            jobs = jobs.filter(job_type=job_types)
            
        paginator = AvailablePagination()
        paginated_jobs = paginator.paginate_queryset(jobs, request, view=self)
        
        if paginated_jobs is not None:
            serializer = JobSerializer(paginated_jobs, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

class AvailableJob(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        search_item = request.query_params.get('search', None)
        job_types = request.query_params.get('type', None)
        
        jobs = get_active_jobs_queryset().order_by('-id')
        
        if search_item and search_item.strip():
            jobs = jobs.filter(
                Q(title__icontains=search_item) |
                Q(location__icontains=search_item)
            )
        
        if job_types and job_types.strip():
            jobs = jobs.filter(job_type=job_types)
            
        paginator = AvailablePagination()
        paginated_queryset = paginator.paginate_queryset(jobs, request, view=self)
        
        if paginated_queryset is not None:
            serializer = JobSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

class JobCreation(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role != 'HR':
            return Response(
                {"detail": "Access Denied: Only HR recruiters can publish job vacancies."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        profile_company = request.user.profile.company

        if not profile_company:
            return Response(
                {"detail": "Please assign a company to your profile before publishing jobs."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = JobSerializer(data=request.data)

        if serializer.is_valid():
            expiry_days = int(request.data.get('expiry_days', 10))  
            serializer.save(
                created_by=request.user,
                company=profile_company,
                expires_at=timezone.now() + timedelta(days=int(expiry_days))
            )
            return Response(
                {"detail": "Job created Successfully"}, 
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

class JobDeletion(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, id):
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            # FIXED: Added explicit 404 status code
            return Response({"detail": "Job not exist"}, status=status.HTTP_404_NOT_FOUND)
        job.delete()
        return Response({"detail": "job deleted successfully"}, status=status.HTTP_200_OK)
    
class EditJob(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, id):
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response({"detail": "Job not exist"}, status=status.HTTP_404_NOT_FOUND)
        serializer = JobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class JobStatus(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, id):
        new_status = request.data.get('job_status')
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response({"detail": "Job not Exist"}, status=status.HTTP_404_NOT_FOUND)
        serializer = JobSerializer(job, data={"job_status": new_status}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Status Updated"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class JobCount(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        job_count = Job.objects.count()
        return Response({"job_count": job_count})