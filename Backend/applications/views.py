from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from jobs.models import Job
from .models import Application
from .serializers import ApplicationSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .tasks import score_application

# Create your views here.

class ApplyJob(APIView):
    def post(self,request,id):
        self.permission_classes=[IsAuthenticated]
        
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response({"detail":"Job Not Exist"},status=status.HTTP_404_NOT_FOUND)
        
        if Application.objects.filter(candidate=request.user,job=job).exists():
           return Response({"detail":"you already for this job"},status=status.HTTP_400_BAD_REQUEST)
       
        serializer = ApplicationSerializer(data=request.data,context = {"request":request})
        
        if serializer.is_valid():
            applications = serializer.save(candidate=request.user,job=job)
            score_application.delay(applications.id)
            return Response({"detail":"Applied to Job Successfully"},status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class ApplicationList(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        try:
            application = Application.objects.filter(candidate=request.user)
        except Application.DoesNotExist:
            return Response({"detail":"Application not Exist"},status=status.HTTP_404_NOT_FOUND)
        serializer = ApplicationSerializer(application,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
class JobApplicantList(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        search_query = request.query_params.get('search',None)
        status_query = request.query_params.get('status',None)
        
        applications = Application.objects.all().order_by('-applied_at')
        
        
        if status_query and status_query =='ALL':
            applications = applications

        if status_query and status_query !='ALL':
            applications = applications.filter(status=status_query)
            
        if search_query:
            applications = applications.filter(
                Q(candidate__username__icontains = search_query)|
                Q(candidate__email__icontains = search_query)|
                Q(job__title__icontains =search_query)
            )
            
        serializer = ApplicationSerializer(applications,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
class ApplicationCount(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        application_count = Application.objects.count()
        return Response({"application_count":application_count})
    

    