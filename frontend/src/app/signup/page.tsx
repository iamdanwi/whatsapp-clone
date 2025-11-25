"use client";

import { useState } from "react";

import { Loader2, MessageSquare, User, Phone } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        about: "Hey there! I am using WhatsApp Clone",
    });

    const { signup, isSigningUp, authUser } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (authUser) {
            router.push("/");
        }
    }, [authUser, router]);

    const validateForm = () => {
        if (!formData.name.trim()) return toast.error("Full name is required");
        if (!formData.phone.trim()) return toast.error("Phone number is required");
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const success = validateForm();

        if (success === true) signup(formData);
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center gap-2 group">
                            <div
                                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                            >
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold mt-2">Create Account</h1>
                            <p className="text-base-content/60">Get started with your free account</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Full Name</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-base-content/40" />
                                </div>
                                <Input
                                    type="text"
                                    className={`input input-bordered w-full pl-10`}
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Phone Number</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-base-content/40" />
                                </div>
                                <Input
                                    type="text"
                                    className={`input input-bordered w-full pl-10`}
                                    placeholder="1234567890"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
                            {isSigningUp ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-base-content/60">
                            Already have an account?{" "}
                            <Link href="/login" className="link link-primary">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Pattern */}
            <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
                <div className="max-w-md text-center">
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[...Array(9)].map((_, i) => (
                            <div
                                key={i}
                                className={`aspect-square rounded-2xl bg-primary/10 ${
                                    i % 2 === 0 ? "animate-pulse" : ""
                                }`}
                            />
                        ))}
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Join our community</h2>
                    <p className="text-base-content/60">
                        Connect with friends, share moments, and stay in touch with your loved ones.
                    </p>
                </div>
            </div>
        </div>
    );
};
export default SignUpPage;
