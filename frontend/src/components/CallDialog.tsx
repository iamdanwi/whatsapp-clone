"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useCallStore } from "@/lib/useCallStore";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff, ArrowLeft, Volume2, UserPlus } from "lucide-react";
import Peer from "simple-peer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "./ui/button";

const CallDialog = () => {
    const { authUser, socket } = useAuthStore();
    const { isCallIncoming, isCallActive, caller, callType, signal, setCallActive, endCall, isInitiator } = useCallStore();
    
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    
    const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
    
    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<Peer.Instance | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on("callUser", (data) => {
            useCallStore.getState().setIncomingCall(data.from, data.signal, data.type || "audio");
        });

        socket.on("callAccepted", (signal) => {
            // setCallActive(true); // Already active for initiator
            connectionRef.current?.signal(signal);
        });

        socket.on("callEnded", () => {
            leaveCall();
        });

        socket.on("toggleVideo", (isVideoOff) => {
            setIsRemoteVideoOff(isVideoOff);
        });

        return () => {
            socket.off("callUser");
            socket.off("callAccepted");
            socket.off("callEnded");
            socket.off("toggleVideo");
        };
    }, [socket]);

    // Handle outgoing call initiation
    useEffect(() => {
        if (isCallActive && isInitiator && !stream && authUser && caller) {
            navigator.mediaDevices.getUserMedia({ video: callType === "video", audio: true }).then((currentStream) => {
                setStream(currentStream);
                streamRef.current = currentStream;
                if (myVideo.current) myVideo.current.srcObject = currentStream;

                const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

                peer.on("signal", (data) => {
                    socket?.emit("call user", {
                        userToCall: caller._id,
                        signalData: data,
                        from: {
                            _id: authUser._id,
                            name: authUser.name,
                            avatar: authUser.avatar
                        },
                        name: authUser?.name,
                        type: callType,
                    });
                });

                peer.on("stream", (currentStream) => {
                    if (userVideo.current) userVideo.current.srcObject = currentStream;
                    setRemoteStream(currentStream);
                });

                connectionRef.current = peer;
            });
        }
    }, [isCallActive, isInitiator, callType, caller, authUser, socket]);

    useEffect(() => {
        if (isCallActive && stream && myVideo.current) {
            myVideo.current.srcObject = stream;
        }
    }, [isCallActive, stream]);

    useEffect(() => {
        if (isCallActive && remoteStream && userVideo.current) {
            userVideo.current.srcObject = remoteStream;
        }
    }, [isCallActive, remoteStream]);

    const answerCall = () => {
        setCallActive(true);
        navigator.mediaDevices.getUserMedia({ video: callType === "video", audio: true }).then((currentStream) => {
            setStream(currentStream);
            streamRef.current = currentStream;
            if (myVideo.current) myVideo.current.srcObject = currentStream;

            const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

            peer.on("signal", (data) => {
                socket?.emit("answer call", { signal: data, to: caller._id });
            });

            peer.on("stream", (currentStream) => {
                if (userVideo.current) userVideo.current.srcObject = currentStream;
                setRemoteStream(currentStream);
            });

            peer.signal(signal);
            connectionRef.current = peer;
        });
    };

    const leaveCall = () => {
        // Stop all tracks first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            streamRef.current = null;
            setStream(null);
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            setRemoteStream(null);
        }

        if (caller?._id) {
            socket?.emit("call ended", { to: caller._id });
        }
        
        connectionRef.current?.destroy();
        endCall();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
            setIsMicMuted(!stream.getAudioTracks()[0].enabled);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
            setIsVideoOff(!stream.getVideoTracks()[0].enabled);
            socket?.emit("toggleVideo", { isVideoOff: !stream.getVideoTracks()[0].enabled, to: caller._id });
        }
    };

    if (isCallIncoming && !isCallActive) {
        return (
            <Dialog open={true}>
                <DialogContent className="w-screen h-screen max-w-none bg-neutral-900 p-0 border-none flex flex-col items-center justify-center overflow-hidden">
                    <DialogTitle className="sr-only">Incoming Call</DialogTitle>
                    {/* Blurred Background */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={caller?.avatar || "/avatar.png"} 
                            alt="" 
                            className="w-full h-full object-cover blur-3xl opacity-30"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                    </div>

                    <div className="z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col items-center gap-2">
                            <div className="avatar mb-4">
                                <div className="size-32 rounded-full ring-4 ring-primary/20 ring-offset-0 relative shadow-2xl">
                                    <img 
                                        src={caller?.avatar || "/avatar.png"} 
                                        alt={caller?.name} 
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">{caller?.name}</h2>
                            <p className="text-lg text-white/70 font-medium">Incoming {callType} call...</p>
                        </div>

                        <div className="flex gap-12 items-center mt-8">
                            <button 
                                onClick={leaveCall} 
                                className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:scale-110 transition-transform"
                            >
                                <PhoneOff className="size-8" />
                            </button>
                            <button 
                                onClick={answerCall} 
                                className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-110 transition-transform animate-bounce"
                            >
                                {callType === "video" ? <Video className="size-8" /> : <Phone className="size-8" />}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (isCallActive) {
        return (
            <Dialog open={true}>
                <DialogContent className="w-screen h-screen max-w-none sm:max-w-4xl sm:h-[80vh] bg-neutral-900 p-0 overflow-hidden flex flex-col border-none rounded-none sm:rounded-lg">
                    <DialogTitle className="sr-only">Active Call</DialogTitle>
                    <div className="flex-1 relative bg-neutral-900 flex items-center justify-center">
                        {/* Remote Video */}
                        <video 
                            playsInline 
                            ref={userVideo} 
                            autoPlay 
                            className="w-full h-full object-cover" 
                        />
                        
                        {/* Audio Call UI */}
                        {(!remoteStream || callType === "audio" || isRemoteVideoOff) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-between bg-[#0b141a] z-10 py-16">
                                {/* Header */}
                                <div className="w-full flex justify-center">
                                    <div className="flex items-center gap-2 text-white/80">
                                        <span className="text-sm font-medium">WhatsApp Audio</span>
                                    </div>
                                </div>

                                {/* Avatar & Info */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="avatar">
                                        <div className="size-32 rounded-full relative shadow-2xl">
                                            <img 
                                                src={caller?.avatar || "/avatar.png"} 
                                                alt={caller?.name} 
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <h3 className="text-3xl font-semibold text-white">{caller?.name}</h3>
                                        <p className="text-white/60 text-lg">
                                            {remoteStream ? "01:23" : (isInitiator ? "Calling..." : "Connecting...")}
                                        </p>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col items-center gap-12 w-full px-8">
                                    <div className="flex items-center justify-between w-full max-w-xs">
                                        <button className="flex flex-col items-center gap-2 text-white/80 hover:text-white">
                                            <div className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                                <Volume2 className="size-6" />
                                            </div>
                                            <span className="text-xs">Speaker</span>
                                        </button>
                                        <button 
                                            onClick={toggleVideo}
                                            className={`flex flex-col items-center gap-2 ${isVideoOff ? 'text-white/80' : 'text-white'}`}
                                        >
                                            <div className={`p-4 rounded-full transition-colors ${!isVideoOff ? 'bg-green-600 hover:bg-green-700' : 'bg-white/10 hover:bg-white/20'}`}>
                                                <Video className="size-6" />
                                            </div>
                                            <span className="text-xs">Video</span>
                                        </button>
                                        <button 
                                            onClick={toggleMic}
                                            className={`flex flex-col items-center gap-2 ${isMicMuted ? 'text-white' : 'text-white/80'}`}
                                        >
                                            <div className={`p-4 rounded-full transition-colors ${isMicMuted ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}`}>
                                                {isMicMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                                            </div>
                                            <span className="text-xs">Mute</span>
                                        </button>
                                        <button className="flex flex-col items-center gap-2 text-white/80 hover:text-white">
                                            <div className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                                <UserPlus className="size-6" />
                                            </div>
                                            <span className="text-xs">Add</span>
                                        </button>
                                    </div>

                                    <button 
                                        onClick={leaveCall} 
                                        className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <PhoneOff className="size-8" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Local Video (PiP) - Only for Video Calls */}
                        {callType === "video" && (
                            <div className="absolute bottom-24 right-4 w-32 h-24 sm:w-48 sm:h-36 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 z-20 transition-all hover:scale-105">
                                <video 
                                    playsInline 
                                    muted 
                                    ref={myVideo} 
                                    autoPlay 
                                    className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} 
                                />
                                {isVideoOff && (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                                        <div className="avatar">
                                            <div className="size-12 rounded-full relative">
                                                <img 
                                                    src={authUser?.avatar || "/avatar.png"} 
                                                    alt="Me" 
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Controls - Only for Video Calls */}
                        {callType === "video" && remoteStream && (
                            <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-center gap-8 bg-gradient-to-t from-black/80 to-transparent z-30 pb-12">
                                <button 
                                    onClick={toggleMic} 
                                    className={`p-4 rounded-full border-none transition-all ${isMicMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'}`}
                                >
                                    {isMicMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                                </button>
                                
                                <button 
                                    onClick={toggleVideo} 
                                    className={`p-4 rounded-full border-none transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'}`}
                                >
                                    {isVideoOff ? <VideoOff className="size-6" /> : <Video className="size-6" />}
                                </button>
                                
                                <button 
                                    onClick={leaveCall} 
                                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 border-none text-white shadow-lg hover:scale-110 transition-transform"
                                >
                                    <PhoneOff className="size-6" />
                                </button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return null;
};

export default CallDialog;
