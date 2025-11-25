"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/useAuthStore";
import { Camera, Mail, User, Moon, Sun, ArrowLeft, Pencil, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const ProfilePage = () => {
    const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark");
        setIsDarkMode(isDark);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        if (newTheme) {
            document.documentElement.classList.add("dark");
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.setAttribute("data-theme", "light");
        }
    };

    useEffect(() => {
        if (!authUser) {
            router.push("/login");
        }
    }, [authUser, router]);

    if (!authUser) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64Image = reader.result as string;
            setSelectedImg(base64Image);
            await updateProfile({ avatar: base64Image });
        };
    };

    return (
        <div className="h-screen pt-20">
            <div className="max-w-md mx-auto p-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <ArrowLeft className="size-6" />
                    </Link>
                    <h1 className="text-xl font-semibold">Profile</h1>
                </div>

                <div className="flex flex-col items-center gap-8">
                    {/* Avatar Upload Section */}
                    <div className="relative group">
                        <div className="size-40 rounded-full overflow-hidden bg-base-200">
                            <img
                                src={selectedImg || authUser?.avatar || "/avatar.png"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label
                            htmlFor="avatar-upload"
                            className={`
                                absolute bottom-2 right-2 
                                bg-green-500 hover:bg-green-600
                                p-3 rounded-full cursor-pointer 
                                transition-all duration-200 shadow-lg
                                ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                            `}
                        >
                            <Camera className="w-5 h-5 text-white" />
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isUpdatingProfile}
                            />
                        </label>
                    </div>

                    {/* Info Sections */}
                    <div className="w-full space-y-6">
                        <div className="space-y-1">
                            <Label className="text-sm text-base-content/60 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Name
                            </Label>
                            <div className="flex items-center justify-between py-2 border-b border-base-300">
                                <span className="text-lg">{authUser?.name}</span>
                                <Pencil className="size-4 text-green-500 cursor-pointer" />
                            </div>
                            <p className="text-xs text-base-content/60">
                                This is not your username or pin. This name will be visible to your contacts.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-sm text-base-content/60 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                About
                            </Label>
                            <div className="flex items-center justify-between py-2 border-b border-base-300">
                                <span className="text-lg">At the movies 🎬</span>
                                <Pencil className="size-4 text-green-500 cursor-pointer" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-sm text-base-content/60 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Phone
                            </Label>
                            <div className="flex items-center justify-between py-2 border-b border-base-300">
                                <span className="text-lg">{authUser?.phone || "+1 (555) 123-4567"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;
