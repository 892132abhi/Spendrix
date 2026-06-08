import './App.css'
import { Routes,Route } from 'react-router-dom'
import HomePage from './Userpages/HomePage'
import Register from './Authentication/UserRegister'
import LoginPage from './Authentication/LoginPage'
import VerifyEmail from './Authentication/VerifyEmail'
import ResetPassword from './Authentication/ResetPassword'
import SetNewPassword from './Authentication/Newpassword'
import ProfilePage from './Userpages/Profile'
import Navbar from './Navbar/Navbar'
import JobListPage from './Userpages/Jobs'
import MyApplicationsPage from './Userpages/Myjoblist'
import ResumePage from './Userpages/Resume'
import HRDashboard from './HR/HRDashboard'
import HRJobsPage from './HR/Jobs'
import ApplicantsPage from './HR/Applicants'
import InterviewsPage from './HR/InterviewPage'
import InterviewerDashboard from './Interviewer/InterviewerDashboard'
import InterviewerCandidates from './Interviewer/Candidates'
import InterviewerSessions from './Interviewer/Interviews'
import InterviewerFeedback from './Interviewer/Feedback'
import AdminDashboard from './Admin/AdminDashboard'
import CreateJobPage from './HR/CreateJob'
import EditJobPage from './HR/EditJob'
import JobDetailsPage from './Userpages/jobdetails'
import EditProfilePage from './Userpages/EditProfile'
import CreateInterviewPage from './HR/CreateInterviews'
import UserManagement from './Admin/UserManagement'
import StaffManagement from './HR/StaffManagement'
import HrProfilePage from './HR/HrProfile'
import ProfileEdit from './HR/HrEditProfile'
import NotificationCenter from './Userpages/Notifications'
import HRNotificationPage from './Userpages/Notifications'
import InterviewerNotifications from './Interviewer/InterviewerNotification'
import ChatPageHR from './HR/HRChat'
import InterviewerChat from './Interviewer/InterChat'
import CandidateChat from './Userpages/CandidateChat'
import CandidateInterviews from './Userpages/InterviewsList'
import CompaniesListPage from './Admin/Companylist'
import CreateCompanyPage from './HR/CreateCompany'
import JobManagement from './Admin/Job management'
import CompanyDetail from "./HR/CompanyDetail";
import InterviewerProfile from './Interviewer/InterviewerProfile'
import InterviewerEditprofile from './Interviewer/EditIntervieweProfile'
import ResumeAnalyzer from './Userpages/Resume'
import AIWorkspace from './Userpages/AIWorkspace'
function App() {

  return (
    <>   
    <Routes>
      <Route path='/registerpage' element={<Register/>}/>
      <Route path='/loginpage' element={<LoginPage/>}/>
      <Route path='/verify-email' element={<VerifyEmail/>}/>
      <Route path='/reset-password' element={<ResetPassword/>}/>
      <Route path='/new-password' element={<SetNewPassword/>}/>
    <Route element={<Navbar/>}>
      <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
      <Route path='/admin-usermanagement' element={<UserManagement/>}/>
      <Route path='/company-list'element={<CompaniesListPage/>}/>
      <Route path='/hrjob-management' element={<JobManagement/>}/>

      <Route path='/hr-dashboard' element={<HRDashboard/>}/>
      <Route path='/hr-staff' element={<StaffManagement/>}/>
      <Route path='/hr-jobs' element={<HRJobsPage/>}/>
      <Route path='/applicants' element={<ApplicantsPage/>}/>
      <Route path='/interviews' element={<InterviewsPage/>}/>
      <Route path='/createinterview' element={<CreateInterviewPage/>}/>
      <Route path='/my-company' element={<CompanyDetail/>}/>
      <Route path='/create-company' element={<CreateCompanyPage/>}/>
      <Route path='/createjob' element={<CreateJobPage/>}/>
      <Route path="/editjob/:id" element={<EditJobPage />} />
      <Route path='/hr-profile' element={<HrProfilePage/>}/>
      <Route path='/hr-editprofile' element={<ProfileEdit/>}/>
      <Route path='/hr-notification' element={<HRNotificationPage/>}/>
      <Route path='/hr/chat/:target/:sessionId' element={<ChatPageHR/>}/>


      <Route path='/interviewer-dashboard' element={<InterviewerDashboard/>}/>
      <Route path='/interviewer-profile' element={<InterviewerProfile/>}/>
      <Route path='/interviewer-editprofile' element={<InterviewerEditprofile/>}/>
      <Route path='candidate-list' element={<InterviewerCandidates/>}/>
      <Route path='/assigned-interviews' element={<InterviewerSessions/>}/>
      <Route path='/feedback' element={<InterviewerFeedback/>}/>
      <Route path='/interviewer/chat/:sessionId' element={<InterviewerChat/>}/>
      <Route path='/interviewer-notification' element={<InterviewerNotifications/>}/>


      <Route path='/' element={<HomePage/>}/>
      <Route path='/profile' element={<ProfilePage/>}/>
      <Route path='/editprofile'element={<EditProfilePage/>}/>
      <Route path='/joblist' element={<JobListPage/>}/>
      <Route path='/myjoblist' element={<MyApplicationsPage/>}/>
      <Route path='/resume' element={<ResumeAnalyzer/>}/>
      <Route path='/chat/:sessionId' element={<CandidateChat/>}/>
      <Route path='/jobdetails/:id' element={<JobDetailsPage/>}/>
      <Route path='/notifications' element={<NotificationCenter/>}/>
      <Route path='/interviewslsit' element={<CandidateInterviews/>}/>
      <Route path='/ai-rag'element={<AIWorkspace/>}/>
      </Route>
      </Routes>
    </>
  )
}

export default App
