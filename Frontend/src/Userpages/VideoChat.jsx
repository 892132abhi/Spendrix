import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff,
  FiAlertTriangle, FiUsers
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

  // Plays the local camera preview once the call UI (with localVideoRef) has actually mounted.
  // Running this here (instead of inside joinCall) avoids a race where the ref is still
  // null because the component was showing the "connecting" screen when the track was created.
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
              <p className="text-xs font-bold text-slate-550 uppercase tracking-widest">
                Waiting for others to join...
              </p>
            </div>
          )}
        </div>
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