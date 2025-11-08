"use client"
import React, { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CreateNewRoom } from "@/services/room";
import { toast } from "@repo/ui/components/ui/sonner";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { Pencil } from "lucide-react";


export default function CreateRoom() {
    const [name, setName] = useState("");
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: CreateNewRoom,
        onSuccess: (data) => {
            toast.success("Success", {
                description: data.message,
                position: "top-center",
                style: {
                    background: "green",
                    color: "white"
                }
            });
            setName("");
            router.push(`/room/${name}`);
        },
        onError: (error: any) => {
            toast.error("Error", {
                description: error.response?.data?.message,
                position: "top-center",
                style: {
                    background: "red",
                    color: "white",
                }
            })
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            return;
        }
        mutation.mutate({ name });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas-bg canvas-grid p-4">
            <div className="absolute inset-0 bg-[var(--gradient-hero)] pointer-events-none" />
            <div className="w-full max-w-md relative z-10">
                <div className="bg-card/80 backdrop-blur-sm border-2 border-border rounded-3xl p-8 shadow-[var(--shadow-medium)]">
                    <div className="flex flex-col items-center mb-3">
                        <div className="w-16 h-16 logo-gradient rounded-2xl flex items-center justify-center mb-4">
                            <Pencil className="w-8 h-8 text-primary-foreground" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <Label htmlFor="Room Name"> Room Name</Label>
                                <Input
                                    id="roomName"
                                    type="text"
                                    placeholder="Coding"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={255}
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="hero"
                                className="w-full"
                                disabled={mutation.isPending}
                            >
                                Create Room</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}