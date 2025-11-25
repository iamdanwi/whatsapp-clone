"use client";

import { useChatStore } from "@/lib/useChatStore";
import { useAuthStore } from "@/lib/useAuthStore";
import Sidebar from "@/components/Sidebar";
import NoChatSelected from "@/components/NoChatSelected";
import ChatContainer from "@/components/ChatContainer";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
    const { selectedChat, isChatsLoading } = useChatStore();
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!authUser && !isCheckingAuth) {
            router.push("/login");
        }
    }, [authUser, isCheckingAuth, router]);

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="size-10 animate-spin" />
            </div>
        );
    }

    if (!authUser) return null;

    return (
        <div className="h-screen bg-base-200">
            <div className="flex items-center justify-center pt-0 px-0 lg:pt-20 lg:px-4">
                <div className="bg-base-100 rounded-none lg:rounded-lg shadow-cl w-full max-w-6xl h-screen lg:h-[calc(100vh-8rem)]">
                    <div className="flex h-full rounded-none lg:rounded-lg overflow-hidden">
                        <Sidebar className={selectedChat ? "hidden lg:flex" : "flex"} />
                        {!selectedChat ? (
                            <NoChatSelected className="hidden lg:flex" />
                        ) : (
                            <ChatContainer className={!selectedChat ? "hidden lg:flex" : "flex"} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
