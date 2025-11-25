"use client";

import { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import { Phone, Video, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useChatStore } from "@/lib/useChatStore";
import { useCallStore } from "@/lib/useCallStore";
import Peer from "simple-peer";

const ChatContainer = ({ className = "" }: { className?: string }) => {
    const { messages, getMessages, isMessagesLoading, selectedChat, subscribeToMessages, unsubscribeFromMessages, setSelectedChat } = useChatStore();
    const { authUser, socket } = useAuthStore();
    const { setCallActive, setIncomingCall } = useCallStore();
    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedChat?._id) {
            getMessages(selectedChat._id);
            subscribeToMessages();
        }

        return () => unsubscribeFromMessages();
    }, [selectedChat?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const { startCall } = useCallStore();
    
    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p>Loading messages...</p>
                </div>
            </div>
        );
    }

    if (!selectedChat) return null;

    const otherUser = selectedChat.isGroup
        ? { name: selectedChat.groupName, avatar: "https://ui-avatars.com/api/?name=" + selectedChat.groupName, _id: selectedChat._id }
        : selectedChat.users.find((u: any) => u._id !== authUser?._id);

    const handleCall = (type: "audio" | "video") => {
        if (!otherUser) return;
        startCall(otherUser, type);
    };
    
    return (
        <div className={`flex-1 flex flex-col overflow-auto ${className}`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-base-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedChat(null)} className="lg:hidden btn btn-ghost btn-circle btn-sm">
                        <ArrowLeft className="size-5" />
                    </button>
                    <div className="avatar">
                        <div className="size-10 rounded-full relative">
                            <img 
                                src={otherUser?.avatar || "/avatar.png"} 
                                alt={otherUser?.name} 
                                className="size-10 object-cover rounded-full"
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium">{otherUser?.name}</h3>
                        <p className="text-xs text-base-content/70">
                            {selectedChat.isGroup ? `${selectedChat.users.length} members` : "Online"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleCall("audio")} className="btn btn-ghost btn-circle btn-sm">
                        <Phone className="size-5" />
                    </button>
                    <button onClick={() => handleCall("video")} className="btn btn-ghost btn-circle btn-sm">
                        <Video className="size-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    const isMyMessage = message.sender._id === authUser?._id;
                    return (
                        <div
                            key={message._id}
                            className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                            ref={messageEndRef}
                        >
                            <div
                                className={`
                                    max-w-[70%] rounded-lg p-3 shadow-sm relative
                                    ${isMyMessage 
                                        ? "bg-orange-500 text-white rounded-tr-none" 
                                        : "bg-white text-gray-900 rounded-tl-none shadow-sm border border-gray-100"
                                    }
                                `}
                            >
                                {!isMyMessage && selectedChat.isGroup && (
                                    <p className="text-xs font-bold text-blue-400 mb-1">
                                        {message.sender.name}
                                    </p>
                                )}
                                <p className="text-sm leading-relaxed break-words">
                                    {message.content}
                                </p>
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[10px] text-white/60">
                                        {new Date(message.createdAt).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            hour12: true 
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <MessageInput />
        </div>
    );
};
export default ChatContainer;
