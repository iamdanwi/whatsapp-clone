"use client";

import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput";
import { Phone, Video, ArrowLeft, Trash2, Search, X } from "lucide-react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useChatStore } from "@/lib/useChatStore";
import { useCallStore } from "@/lib/useCallStore";
import Peer from "simple-peer";

const ChatContainer = ({ className = "" }: { className?: string }) => {
    const { messages, getMessages, isMessagesLoading, selectedChat, subscribeToMessages, unsubscribeFromMessages, setSelectedChat, isTyping, subscribeToTyping, unsubscribeFromTyping } = useChatStore();
    const { authUser, socket } = useAuthStore();
    const { setCallActive, setIncomingCall } = useCallStore();
    const messageEndRef = useRef<HTMLDivElement>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (selectedChat?._id) {
            getMessages(selectedChat._id);
            subscribeToMessages();
            subscribeToTyping();
        }

        return () => {
            unsubscribeFromMessages();
            unsubscribeFromTyping();
        };
    }, [selectedChat?._id, getMessages, subscribeToMessages, unsubscribeFromMessages, subscribeToTyping, unsubscribeFromTyping]);

    useEffect(() => {
        if (messageEndRef.current && messages && !searchQuery) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping, searchQuery]);

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

    const filteredMessages = messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return (
        <div className={`flex-1 flex flex-col overflow-auto ${className} bg-[url('/bg-pattern.png')] bg-repeat bg-center`}>
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
                            {isTyping ? (
                                <span className="text-primary animate-pulse font-semibold">Typing...</span>
                            ) : selectedChat.isGroup ? (
                                `${selectedChat.users.length} members`
                            ) : (
                                useAuthStore.getState().onlineUsers.includes(otherUser?._id) ? (
                                    "Online"
                                ) : (
                                    otherUser?.lastSeen ? `Last seen at ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Offline"
                                )
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isSearchOpen ? (
                        <div className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1">
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-transparent border-none outline-none text-sm w-32 sm:w-48"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="btn btn-ghost btn-circle btn-xs">
                                <X className="size-4" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsSearchOpen(true)} className="btn btn-ghost btn-circle btn-sm">
                            <Search className="size-5" />
                        </button>
                    )}
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
                {filteredMessages.map((message) => {
                    const isMyMessage = message.sender._id === authUser?._id;
                    return (
                        <div
                            key={message._id}
                            className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                            ref={messageEndRef}
                        >
                            <div
                                className={`
                                    max-w-[70%] rounded-lg p-3 shadow-sm relative group
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
                                {message.image && (
                                    <img 
                                        src={message.image} 
                                        alt="Attachment" 
                                        className="sm:max-w-[200px] rounded-md mb-2"
                                    />
                                )}
                                {message.content && (
                                    <p className="text-sm leading-relaxed break-words">
                                        {message.content}
                                    </p>
                                )}
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className={`text-[10px] ${isMyMessage ? "text-white/80" : "text-gray-500"}`}>
                                        {new Date(message.createdAt).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            hour12: true 
                                        })}
                                    </span>
                                    {isMyMessage && (
                                        <button 
                                            onClick={() => useChatStore.getState().deleteMessage(message._id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-white/70 hover:text-white"
                                            title="Delete for everyone"
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-900 rounded-lg rounded-tl-none p-3 shadow-sm border border-gray-100 flex items-center gap-1">
                            <span className="loading loading-dots loading-xs"></span>
                        </div>
                    </div>
                )}
                <div ref={messageEndRef} />
            </div>

            <MessageInput />
        </div>
    );
};
export default ChatContainer;
