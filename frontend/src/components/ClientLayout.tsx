"use client";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/lib/useAuthStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

if (typeof window !== "undefined" && !window.global) {
    (window as any).global = window;
}

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="size-10 animate-spin" />
            </div>
        );
    }

    return (
        <>
            {children}
            <Toaster />
        </>
    );
}
