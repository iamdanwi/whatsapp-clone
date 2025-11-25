"use client";

import { useState } from "react";

import { Loader2, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        phone: "",
    });
    const { login, isLoggingIn, authUser } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (authUser) {
            router.push("/");
        }
    }, [authUser, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        login(formData);
    };

    return (
        <div className="h-screen grid lg:grid-cols-2">
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
                            <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
                            <p className="text-base-content/60">Sign in to your account</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        <Button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
                            {isLoggingIn ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-base-content/60">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="link link-primary">
                                Create account
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
                    <h2 className="text-3xl font-bold mb-4">Connect with friends</h2>
                    <p className="text-base-content/60">
                        Share moments, stay in touch, and make memories with your loved ones.
                    </p>
                </div>
            </div>
        </div>
    );
};
export default LoginPage;
