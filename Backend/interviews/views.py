from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Interview
from applications.models import Application
from .serializers import InterviewSerializer,InterViewerSerializer,ApplicationLookUpSerializer,AssignedInterviewCandidateSerializer,CandidateInterviewSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
import uuid
from jobs.models import Job
from .service import run_ai_interview_scheduler
# Create your views here.
User =get_user_model()
class InterviewCreateView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        serializer = InterviewSerializer(data=request.data)
        if serializer.is_valid():
            interview = serializer.save(hr_name=request.user)
            application = interview.application
            application.status='INTERVIEW'
            application.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class InterViewerLookUp(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        Interviewers = User.objects.filter(role='INTERVIEWER')
        serializer = InterViewerSerializer(Interviewers,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
class AppilcationLookUp(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        applications = Application.objects.all().select_related('candidate', 'job')
        
        serializer = ApplicationLookUpSerializer(applications,many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class InterviewList(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        try:
            status_filter = request.query_params.get('status')
            date_filter = request.query_params.get('date')
            
            Interview_list = Interview.objects.all().order_by('-created_at')
            if status_filter and status_filter !='ALL':
                Interview_list = Interview_list.filter(status=status_filter)
            if date_filter:
                Interview_list = Interview_list.filter(sheduled_date__date= date_filter)
            serializer = InterviewSerializer(Interview_list,many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error":str(e)},status=status.HTTP_400_BAD_REQUEST)
    
class InterviewCount(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        Interview_count = Interview.objects.count()
        return Response({"interview_count":Interview_count})
    
class InterviewStatusCount(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        interviews = Interview.objects.filter(interviewer = request.user)
        
        total_assigned = interviews.count()
        today_session = interviews.filter(sheduled_date__date=timezone.now().date()).count()
        pending_feedback = interviews.filter(status='COMPLETED', note__isnull=True).count()
        
        completed_interviews = interviews.filter(status='COMPLETED',note__isnull=False).count()
        
        return Response({
            "total_assigned":total_assigned,
            "today_session":today_session,
            "pending_feedback":pending_feedback,
            "completed_interviews":completed_interviews,
        },status=status.HTTP_200_OK)
        
class AssignedPagination(PageNumberPagination):
    max_page_size=10
    page_query_param='page'
    page_size_query_param = 'page_size'
    max_page_size=50
    
class AssignedCandidateListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            search = request.query_params.get('search')
            status_filter = request.query_params.get('status')
            role = request.query_params.get('role')
            sort = request.query_params.get('sort')
            
            candidate_list = Interview.objects.filter(interviewer=request.user).select_related(
                'application__candidate__profile', 
                'application__job'
            ).distinct()
            
            if search:
                candidate_list = candidate_list.filter(
                    Q(application__candidate__profile__first_name__icontains=search) |
                    Q(application__candidate__profile__last_name__icontains=search) |
                    Q(application__candidate__username__icontains=search) |
                    Q(application__candidate__profile__skills__icontains=search) |
                    Q(application__job__title__icontains=search)
                )
            
            if status_filter and status_filter not in ['ALL', 'ASSIGNED']:
                candidate_list = candidate_list.filter(status=status_filter)
                
            if role and role != 'ALL':
                candidate_list = candidate_list.filter(application__job__title=role)
                
            if sort == "date-asc":
                candidate_list = candidate_list.order_by("sheduled_date")
            elif sort == "date-desc":
                candidate_list = candidate_list.order_by('-sheduled_date')
            elif sort == "exp-desc":
                candidate_list = candidate_list.order_by("-application__candidate__profile__experience_years")
            else:
                candidate_list = candidate_list.order_by("-id")

            paginator = AssignedPagination()
            paginated_candidates = paginator.paginate_queryset(candidate_list, request, view=self)
            
            if paginated_candidates is not None:
                serializer = AssignedInterviewCandidateSerializer(paginated_candidates, many=True)
                return paginator.get_paginated_response(serializer.data)

            serializer = AssignedInterviewCandidateSerializer(candidate_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print("Candidate List Sync Failure:", e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class CandidateNoteupdates(APIView):
    permission_classes=[IsAuthenticated]
    def patch(self,request,id):
        interviews = Interview.objects.get(id=id,interviewer=request.user)
        
        interviews.strength = request.data.get('strength',interviews.strength)
        interviews.weakness = request.data.get('weakness',interviews.weakness)
        interviews.decision_note = request.data.get('decision_note',interviews.decision_note)
        
        interviews.save()
        return Response({"message":"Assessment Added"})
    
class CandidateDecisionUpdate(APIView):
    permission_classes=[IsAuthenticated]
    def patch(self,request,id):
        interview = Interview.objects.get(id=id,interviewer=request.user)
        decision = request.data.get('decision')
        
        if decision =='SHORT_LISTED':
            interview.application.status ='SHORT_LISTED'
            interview.status = 'SHORT_LISTED'
            
        elif decision =='REJECTED':
            interview.application.status = 'REJECTED'
            interview.status ='CANCELLED'
        else:
            return Response({"error":"invalid decision"},status=400)
        
        interview.application.save()
        interview.save()
        return Response({"message":"Decision Updated"})
    
class AssignedInterviews(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        Interview_list = Interview.objects.filter(interviewer=request.user).select_related(
            'application__candidate__profile','application__job'
        )
        serializer = CandidateInterviewSerializer(Interview_list,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    

class CandidateInterview(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        
        interviews = Interview.objects.filter(application__candidate=request.user,status='SHEDULED').order_by('sheduled_date')
        
        serializer = CandidateInterviewSerializer(interviews,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

