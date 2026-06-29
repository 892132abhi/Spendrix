import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import AgoraRTM from 'agora-rtm-sdk';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff,
  FiAlertTriangle, FiUsers, FiMessageSquare, FiSend, FiX
} from 'react-icons/fi';

const { RTM } = AgoraRTM;
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

const VideoCallPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteContainerRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const hasJoinedRef = useRef(false);

  // --- RTM (chat) refs ---
  const rtmRef = useRef(null);
  const rtmLoggedInRef = useRef(false);
  const chatEndRef = useRef(null);

  const [status, setStatus] = useState('connecting'); // connecting | joined | error
  const [errorMsg, setErrorMsg] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteCount, setRemoteCount] = useState(0);

  // --- chat state ---
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { id, uid, text, isMe, ts }
  const [chatInput, setChatInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [rtmReady, setRtmReady] = useState(false);

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

  // --- leave RTM (chat) cleanly ---
  const leaveChat = useCallback(async () => {
    try {
      const rtm = rtmRef.current;
      if (rtm && rtmLoggedInRef.current) {
        await rtm.unsubscribe(String(interviewId)).catch(() => {});
        await rtm.logout();
      }
    } catch (err) {
      console.error('Error while leaving RTM:', err);
    } finally {
      rtmLoggedInRef.current = false;
      rtmRef.current = null;
    }
  }, [interviewId]);

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

        // --- start RTM (chat) after RTC has joined successfully ---
        // We reuse app_id/uid/channel from the same response. If your backend
        // needs a *separate* RTM token, fetch it here instead, e.g.:
        // const rtmRes = await api.get(`interviews/agora/rtm-token/${interviewId}/`);
        initChat({ app_id, channel, uid, rtmToken: res.data.rtm_token });
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

    // --- RTM (chat) init ---
    const initChat = async ({ app_id, channel, uid, rtmToken }) => {
      try {
        const rtm = new RTM(app_id, String(uid));
        rtmRef.current = rtm;

        rtm.addEventListener('message', (event) => {
          // event.publisher = sender uid, event.message = text payload
          if (!isMounted) return;
          if (String(event.publisher) === String(uid)) return; // skip echo, we add our own locally
          setMessages((prev) => [
            ...prev,
            {
              id: `${event.publisher}-${Date.now()}-${Math.random()}`,
              uid: event.publisher,
              text: event.message,
              isMe: false,
              ts: Date.now(),
            },
          ]);
          setChatOpen((open) => {
            if (!open) setUnreadCount((c) => c + 1);
            return open;
          });
        });

        rtm.addEventListener('status', (event) => {
          if (event.state === 'DISCONNECTED' || event.state === 'FAILED') {
            rtmLoggedInRef.current = false;
          }
        });

        await rtm.login(rtmToken ? { token: rtmToken } : undefined);
        rtmLoggedInRef.current = true;

        await rtm.subscribe(String(channel));

        if (isMounted) setRtmReady(true);
      } catch (err) {
        // Chat failing should never block or break the video call.
        console.error('RTM init error (chat will be unavailable):', err);
        toast.error('Chat is unavailable for this call.');
      }
    };

    joinCall();

    return () => {
      isMounted = false;
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);
      leaveCall();
      leaveChat();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  // Plays the local camera preview once the call UI (with localVideoRef) has actually mounted.
  useEffect(() => {
    if (status === 'joined' && localVideoRef.current && localTracksRef.current.videoTrack) {
      localTracksRef.current.videoTrack.play(localVideoRef.current);
    }
  }, [status]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatOpen]);

  const handleEndCall = async () => {
    await leaveChat();
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

  const toggleChat = () => {
    setChatOpen((open) => {
      const next = !open;
      if (next) setUnreadCount(0);
      return next;
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const rtm = rtmRef.current;
    const channel = String(interviewId);

    // Optimistically show our own message
    const localMsg = {
      id: `me-${Date.now()}-${Math.random()}`,
      uid: 'me',
      text,
      isMe: true,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, localMsg]);
    setChatInput('');

    if (!rtm || !rtmReady) {
      toast.error('Chat is not connected.');
      return;
    }

    try {
      await rtm.publish(channel, text);
    } catch (err) {
      console.error('Failed to send chat message:', err);
      toast.error('Message failed to send.');
    }
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
    <div className="h-screen bg-slate-950 flex flex-col p-4 gap-4">
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

        {/* --- Chat side panel --- */}
        {chatOpen && (
          <div className="w-80 shrink-0 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                Chat
              </span>
              <button
                onClick={toggleChat}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 min-h-0">
              {messages.length === 0 && (
                <p className="text-[11px] text-slate-500 text-center mt-4">
                  No messages yet. Say hi!
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed break-words ${
                    m.isMe
                      ? 'self-end bg-indigo-600 text-white'
                      : 'self-start bg-slate-800 text-slate-100'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 px-3 py-3 border-t border-slate-800 shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-all"
              >
                <FiSend className="w-3.5 h-3.5" />
              </button>
            </form>
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
        <button
          onClick={toggleChat}
          className={`relative p-4 rounded-full transition-all ${
            chatOpen ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <FiMessageSquare />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white">
              {unreadCount}
            </span>
          )}
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