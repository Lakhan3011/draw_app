"use client"

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Pencil } from "lucide-react";
import { toast } from "@repo/ui/components/ui/sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { SignUpUser, SignInUser } from "@/services/auth";

export default function Auth() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signUpMutation = useMutation({
        mutationFn: SignUpUser,
        onSuccess: (data) => {
            toast.success("Success", {
                description: data.message,
                position: "top-center",
                style: {
                    background: "green",
                    color: "white",
                },
            });
            setName("");
            setEmail("");
            setPassword("");
            setIsSignUp(false);
            router.push('/auth')
        },
        onError: (error: any) => {
            toast.error("Error", {
                description: error?.response?.data?.message,
                position: "top-center",
                style: {
                    background: "red",
                    color: "white",
                }
            });
        }
    })

    const signInMutation = useMutation({
        mutationFn: SignInUser,
        onSuccess: (data) => {
            toast.success("Success", {
                description: data.message,
                position: "top-center",
                style: {
                    background: "green",
                    color: "white",
                },
            });
            localStorage.setItem('token', data.token);
            setEmail("");
            setPassword("");
            router.push('/existing-rooms');
        },
        onError: (error: any) => {
            toast.error("Error", {
                description: error?.response?.data?.message,
                position: "top-center",
                style: {
                    background: "red",
                    color: "white",
                }
            });
        }
    })



    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignUp) {
            signUpMutation.mutate({ name, email, password });
            return;
        }
        signInMutation.mutate({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas-bg canvas-grid p-4">
            <div className="absolute inset-0 bg-[var(--gradient-hero)] pointer-events-none" />
            <div className="w-full max-w-md relative z-10">
                <div className="bg-card/80 backdrop-blur-sm border-2 border-border rounded-3xl p-8 shadow-[var(--shadow-medium)]">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-700/80 to-purple-700 rounded-2xl flex items-center justify-center mb-4">
                            <Pencil className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold text-gradient mb-2">
                            {isSignUp ? "Join DrawApp" : "Welcome Back"}
                        </h1>
                        <p className="text-muted-foreground text-center">
                            {isSignUp
                                ? "Create your account to start collaborating"
                                : "Sign in to continue drawing"}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignUp && <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="lakhanDev"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={6}
                                maxLength={255}
                            />
                        </div>}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                maxLength={255}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                maxLength={100}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="hero"
                            className="w-full"
                            disabled={signUpMutation.isPending || signInMutation.isPending}
                        >
                            {signUpMutation.isPending || signInMutation.isPending ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            {isSignUp
                                ? "Already have an account? Sign in"
                                : "Don't have an account? Sign up"}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            ← Back to home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
