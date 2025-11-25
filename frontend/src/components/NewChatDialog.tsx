"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "@/lib/useChatStore";
import { useAuthStore } from "@/lib/useAuthStore";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquarePlus, Search, ArrowLeft, Users, UserPlus } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

const NewChatDialog = () => {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { setSelectedChat, chats, getChats } = useChatStore();
    // Assuming setSelectedUser is a new state setter or prop that needs to be defined
    // For the purpose of this faithful edit, we'll define a dummy one if not provided.
    // In a real app, this would likely be part of a larger state management or prop drilling.
    const [selectedUser, setSelectedUser] = useState<any>(null);


    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get("/auth/users");
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartChat = async (userId: string) => {
        try {
            // Check if chat already exists locally
            // This logic might be better handled by backend or by checking `chats` store
            // But `createDirectChat` in backend handles "get existing or create new" logic.
            
            const res = await axiosInstance.post("/chats", { userId });
            const chat = res.data;
            
            // Update store
            await getChats(); // Refresh list
            setSelectedChat(chat);
            setOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to start chat");
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="New Chat">
                    <MessageSquarePlus className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-none shadow-none w-screen h-screen max-w-none sm:max-w-[425px] sm:h-auto sm:rounded-lg sm:shadow-lg p-0 flex flex-col gap-0">
                <DialogHeader className="p-4 border-b border-border bg-muted/50 flex flex-row items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="sm:hidden -ml-2">
                        <ArrowLeft className="size-5" />
                    </Button>
                    <DialogTitle className="text-lg font-semibold">New Chat</DialogTitle>
                </DialogHeader>
                
                <div className="p-2 border-b border-border bg-background">
                    <div className="relative flex items-center bg-muted/50 rounded-lg px-2">
                        <Search className="size-5 text-muted-foreground min-w-5" />
                        <Input
                            placeholder="Search contacts..."
                            className="bg-transparent border-none focus-visible:ring-0 h-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    {isLoading ? (
                        <div className="text-center p-4 text-base-content/60">Loading contacts...</div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="divide-y divide-border">
                            {filteredUsers.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => handleStartChat(user._id)}
                                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                                >
                                    <div className="relative">
                                        <img
                                            src={user.avatar || "/avatar.png"}
                                            alt={user.name}
                                            className="size-12 rounded-full object-cover"
                                        />
                                        {user.isOnline && (
                                            <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate text-base-content">{user.name}</h3>
                                        <p className="text-sm text-base-content/60 truncate">{user.about || "Hey there! I am using WhatsApp."}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 text-base-content/60">
                            <p>No contacts found</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NewChatDialog;
