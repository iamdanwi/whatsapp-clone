import { useEffect, useState } from "react";
import { Users, LogOut, User, MessageSquare, MessageSquarePlus, MoreVertical, CircleDashed, Search } from "lucide-react";
import CreateGroupDialog from "./CreateGroupDialog";
import NewChatDialog from "./NewChatDialog";
import { useAuthStore } from "@/lib/useAuthStore";
import { useChatStore } from "@/lib/useChatStore";
import Link from "next/link";

const Sidebar = ({ className = "" }: { className?: string }) => {
    const { getChats, chats, selectedChat, setSelectedChat, isChatsLoading } = useChatStore();
    const { onlineUsers, logout, authUser } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    useEffect(() => {
        getChats();
    }, [getChats]);

    const filteredChats = showOnlineOnly
        ? chats.filter((chat) => {
            if (chat.isGroup) return true;
            const otherUser = chat.users.find((u: any) => u._id !== authUser?._id);
            return onlineUsers.includes(otherUser?._id);
        })
        : chats;

    if (isChatsLoading) return (
        <aside className={`h-full w-full lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 ${className}`}>
            <div className="border-b border-base-300 w-full p-4 flex items-center justify-between bg-base-100 z-10">
                <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
                <div className="flex gap-2">
                    <div className="skeleton w-8 h-8 rounded-full"></div>
                    <div className="skeleton w-8 h-8 rounded-full"></div>
                    <div className="skeleton w-8 h-8 rounded-full"></div>
                </div>
            </div>
            <div className="overflow-y-auto w-full py-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full p-3 flex items-center gap-3">
                        <div className="skeleton w-12 h-12 rounded-full shrink-0"></div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="skeleton h-4 w-32"></div>
                            <div className="skeleton h-3 w-16"></div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );

    return (
        <aside className={`h-full w-full lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 ${className}`}>
            {/* Header */}
            <div className="border-b border-base-300 w-full px-4 py-3 flex items-center justify-between sticky top-0 bg-base-200 z-10">
                <div className="flex items-center gap-2">
                    <Link href="/profile" className="avatar">
                        <div className="size-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 cursor-pointer relative">
                            <img 
                                src={authUser?.avatar || "/avatar.png"} 
                                alt={authUser?.name} 
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                    </Link>
                </div>
                <div className="flex items-center gap-3 text-zinc-500">
                    <button className="btn btn-ghost btn-circle btn-sm" title="Status">
                        <CircleDashed className="size-5" />
                    </button>
                    <NewChatDialog />
                    <button onClick={logout} className="btn btn-ghost btn-circle btn-sm" title="Logout">
                        <MoreVertical className="size-5" />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 bg-base-100 border-b border-base-300">
                <div className="relative flex items-center bg-base-200 rounded-lg px-2">
                    <Search className="size-5 text-zinc-500 min-w-5" />
                    <input 
                        type="text" 
                        placeholder="Search or start new chat" 
                        className="input input-sm bg-transparent border-none w-full focus:outline-none"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="overflow-y-auto w-full flex-1 bg-base-100">
                {filteredChats.map((chat) => {
                     const otherUser = chat.isGroup 
                        ? { name: chat.groupName, avatar: "https://ui-avatars.com/api/?name=" + chat.groupName } 
                        : chat.users.find((u: any) => u._id !== authUser?._id);
                     
                     const isOnline = !chat.isGroup && onlineUsers.includes(otherUser?._id);
                     const lastMessage = chat.lastMessage;

                    return (
                        <button
                            key={chat._id}
                            onClick={() => setSelectedChat(chat)}
                            className={`
                                w-full p-3 flex items-center gap-3
                                hover:bg-base-200 transition-colors
                                border-b border-base-300 last:border-b-0
                                ${selectedChat?._id === chat._id ? "bg-base-200" : ""}
                            `}
                        >
                            <div className="relative mx-auto lg:mx-0">
                                <img
                                    src={otherUser?.avatar || "/avatar.png"}
                                    alt={otherUser?.name}
                                    className="size-12 object-cover rounded-full"
                                />
                                {isOnline && (
                                    <span
                                        className="absolute bottom-0 right-0 size-3 bg-green-500 
                                        rounded-full ring-2 ring-zinc-900"
                                    />
                                )}
                            </div>

                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-medium truncate text-base-content">{otherUser?.name}</h3>
                                    {lastMessage && (
                                        <span className="text-xs text-zinc-500 shrink-0">
                                            {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-zinc-500 truncate">
                                    {lastMessage ? (
                                        <span className={selectedChat?._id === chat._id ? "text-base-content" : ""}>
                                            {lastMessage.sender._id === authUser?._id ? "You: " : ""}
                                            {lastMessage.content}
                                        </span>
                                    ) : (
                                        <span className="italic">No messages yet</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}

                {filteredChats.length === 0 && (
                    <div className="text-center text-zinc-500 py-4">No chats found</div>
                )}
            </div>
        </aside>
    );
};
export default Sidebar;
