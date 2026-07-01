import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff,
  FiAlertTriangle, FiUsers, FiMessageSquare
} from 'react-icons/fi';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

const VideoCallPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteContainerRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const hasJoinedRef = useRef(false);

  const [status, setStatus] = useState('connecting'); // connecting | joined | error
  const [errorMsg, setErrorMsg] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteCount, setRemoteCount] = useState(0);

  // Chat integration states and refs
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUserRole, setOtherUserRole] = useState('candidate'); // 'candidate' | 'interviewer' (only for HR)
  const [interviewDetail, setInterviewDetail] = useState(null);
  const socketRef = useRef(null);
  const chatScrollRef = useRef(null);

  const leaveCall = useCallback(async () => {
    try {
      const { audioTrack, videoTrack } = localTracksRef.current;
      audioTrack?.close();
      videoTrack?.close();
      localTracksRef.current = { audioTrack: null, videoTrack: null };

      if (hasJoinedRef.current) {
        await client.leave();
        hasJoinedRef.current = false;
      }

      if (remoteContainerRef.current) {
        remoteContainerRef.current.innerHTML = '';
      }
    } catch (err) {
      console.error('Error while leaving call:', err);
    }
  }, []);

  // 1. Fetch user role, interview details and initial chat room
  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      try {
        const profileRes = await api.get('accounts/profile/');
        if (!isMounted) return;
        const role = profileRes.data.role;
        setUserRole(role);
        setCurrentUserId(profileRes.data.user_id);

        let interviewsRes;
        if (role === 'CANDIDATE') {
          interviewsRes = await api.get('interviews/candidateinterviews/');
        } else if (role === 'INTERVIEWER') {
          interviewsRes = await api.get('interviews/assignedinterviews/');
        } else {
          interviewsRes = await api.get('interviews/interviewlist/?');
        }

        if (!isMounted) return;

        const interview = (interviewsRes.data || []).find(
          item => String(item.id) === String(interviewId)
        );

        if (interview) {
          setInterviewDetail(interview);
          
          let otherId = null;
          if (role === 'CANDIDATE' || role === 'INTERVIEWER') {
            otherId = interview.hr_id;
          } else {
            otherId = interview.candidate_id; // Default HR chat target is candidate
          }

          if (otherId) {
            const roomRes = await api.post('chat/room/', {
              other_user_id: otherId,
              interview_id: interviewId
            });
            if (isMounted) {
              setRoomId(roomRes.data.room_id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to resolve chat details:', err);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  // 2. Manage WebSocket connection and load history when roomId is resolved
  useEffect(() => {
    if (!roomId) return;
    let isMounted = true;

    const setupChat = async () => {
      try {
        const historyRes = await api.get(`chat/history/${roomId}/`);
        if (!isMounted) return;

        const history = (historyRes.data || []).map(m => ({
          text: m.text,
          sender: m.sender_username,
          is_me: m.sender_id === currentUserId
        }));
        setMessages(history);

        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${import.meta.env.VITE_WS_URL}/ws/chat/${roomId}/`;
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onmessage = (e) => {
          if (!isMounted) return;
          const data = JSON.parse(e.data);
          setMessages((prev) => [...prev, {
            text: data.message,
            sender: data.sender_username,
            is_me: data.sender_id === currentUserId
          }]);
        };
      } catch (err) {
        console.error('Error establishing chat sync:', err);
      }
    };

    setupChat();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [roomId, currentUserId]);

  // 3. Auto-scroll chat panel to bottom on new messages
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 'message': newMessage }));
      setNewMessage('');
    }
  };

  // 4. Switch chat line (For HR coordinator only)
  const handleSwitchTarget = async (targetRole) => {
    if (!interviewDetail) return;
    setOtherUserRole(targetRole);
    setMessages([]);
    setRoomId(null);
    if (socketRef.current) {
      socketRef.current.close();
    }

    try {
      const otherId = targetRole === 'candidate' 
        ? interviewDetail.candidate_id 
        : interviewDetail.interviewer_id;

      if (!otherId) {
        toast.error(`${targetRole === 'candidate' ? 'Candidate' : 'Interviewer'} is not assigned/found.`);
        return;
      }

      const roomRes = await api.post('chat/room/', {
        other_user_id: otherId,
        interview_id: interviewId
      });
      setRoomId(roomRes.data.room_id);
    } catch (err) {
      console.error('Failed to switch chat room:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleUserPublished = async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);

        if (mediaType === 'video') {
          let remoteDiv = document.getElementById(`remote-${user.uid}`);
          if (!remoteDiv) {
            remoteDiv = document.createElement('div');
            remoteDiv.id = `remote-${user.uid}`;
            remoteDiv.className = 'w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800';
            remoteContainerRef.current?.appendChild(remoteDiv);
          }
          user.videoTrack?.play(remoteDiv);
        }

        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }

        if (isMounted) {
          setRemoteCount(client.remoteUsers.length);
        }
      } catch (err) {
        console.error('Subscribe error:', err);
      }
    };

    const handleUserUnpublished = (user, mediaType) => {
      if (mediaType === 'video') {
        const el = document.getElementById(`remote-${user.uid}`);
        if (el) el.remove();
      }
      if (isMounted) {
        setRemoteCount(client.remoteUsers.length);
      }
    };

    const handleUserLeft = (user) => {
      const el = document.getElementById(`remote-${user.uid}`);
      if (el) el.remove();
      if (isMounted) {
        setRemoteCount(client.remoteUsers.length);
      }
    };

    const joinCall = async () => {
      try {
        setStatus('connecting');

        const res = await api.get(`interviews/agora/token/${interviewId}/`);
        const { app_id, channel, token, uid } = res.data;

        if (!app_id || !channel || !token) {
          throw new Error('Incomplete call credentials received from server');
        }

        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-left', handleUserLeft);

        await client.join(app_id, channel, token, uid);
        hasJoinedRef.current = true;

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { audioTrack, videoTrack };

        await client.publish([audioTrack, videoTrack]);

        if (isMounted) {
          setStatus('joined');
        }
      } catch (err) {
        console.error('Agora join error:', err);
        const serverMsg = err.response?.data?.error;
        const message =
          serverMsg ||
          (err.name === 'NotAllowedError'
            ? 'Camera or microphone access was blocked. Allow access and try again.'
            : 'Failed to join the interview room.');

        if (isMounted) {
          setErrorMsg(message);
          setStatus('error');
        }
        toast.error(message);
      }
    };

    joinCall();

    return () => {
      isMounted = false;
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);
      leaveCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  useEffect(() => {
    if (status === 'joined' && localVideoRef.current && localTracksRef.current.videoTrack) {
      localTracksRef.current.videoTrack.play(localVideoRef.current);
    }
  }, [status]);

  const handleEndCall = async () => {
    await leaveCall();
    navigate(-1);
  };

  const toggleMic = async () => {
    const { audioTrack } = localTracksRef.current;
    if (!audioTrack) return;
    await audioTrack.setEnabled(!micOn);
    setMicOn(!micOn);
  };

  const toggleCam = async () => {
    const { videoTrack } = localTracksRef.current;
    if (!videoTrack) return;
    await videoTrack.setEnabled(!camOn);
    setCamOn(!camOn);
  };

  if (status === 'error') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center gap-4">
        <FiAlertTriangle className="w-10 h-10 text-rose-500" />
        <p className="text-sm font-bold text-slate-200 max-w-sm">{errorMsg}</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Connecting to interview room...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col p-4 gap-4 overflow-hidden">
      <div className="flex items-center justify-between shrink-0 px-2">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <FiUsers className="w-3.5 h-3.5 text-indigo-400" />
          {remoteCount + 1} {remoteCount + 1 === 1 ? 'Participant' : 'Participants'}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Video Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            <div ref={localVideoRef} className="w-full h-full" />
            <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
              You
            </span>
            {!camOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <FiVideoOff className="w-8 h-8 text-slate-600" />
              </div>
            )}
          </div>

          <div
            ref={remoteContainerRef}
            className="w-full h-full grid gap-2"
            style={{
              gridTemplateColumns: remoteCount > 1 ? 'repeat(2, 1fr)' : '1fr',
            }}
          >
            {remoteCount === 0 && (
              <div className="w-full h-full rounded-2xl bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Waiting for others to join...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Chat Sidebar */}
        {showChat && (
          <div className="w-80 md:w-90 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-800 flex flex-col gap-2.5 bg-slate-950">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Secure Consultation</h4>
                <button 
                  onClick={() => setShowChat(false)} 
                  className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Scope/Target toggles for HR recruiter */}
              {userRole === 'HR' && interviewDetail && (
                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-850">
                  <button
                    onClick={() => handleSwitchTarget('candidate')}
                    className={`flex-1 py-1.5 rounded-md text-[8px] font-black uppercase tracking-wider transition-all ${
                      otherUserRole === 'candidate'
                        ? 'bg-indigo-650 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Candidate ({interviewDetail.candidate_name || 'Candidate'})
                  </button>
                  <button
                    onClick={() => handleSwitchTarget('interviewer')}
                    className={`flex-1 py-1.5 rounded-md text-[8px] font-black uppercase tracking-wider transition-all ${
                      otherUserRole === 'interviewer'
                        ? 'bg-indigo-650 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Interviewer ({interviewDetail.interviewer_name || 'Interviewer'})
                  </button>
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <p className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">No messages yet.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      msg.is_me 
                        ? 'bg-indigo-650 text-white rounded-tr-none shadow-md shadow-indigo-900/10' 
                        : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-750'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1.5 px-1">
                      {msg.is_me ? 'You' : msg.sender}
                    </span>
                  </div>
                ))
              )}
              <div ref={chatScrollRef} />
            </div>

            {/* Input Message Box */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type message..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 py-3 shrink-0">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all ${
            micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'
          }`}
        >
          {micOn ? <FiMic /> : <FiMicOff />}
        </button>
        <button
          onClick={toggleCam}
          className={`p-4 rounded-full transition-all ${
            camOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'
          }`}
        >
          {camOn ? <FiVideo /> : <FiVideoOff />}
        </button>
        
        {/* Toggle Chat Sidebar */}
        <button
          onClick={() => setShowChat(!showChat)}
          className={`p-4 rounded-full transition-all ${
            showChat ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <FiMessageSquare />
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-all"
        >
          <FiPhoneOff />
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;