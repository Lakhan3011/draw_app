"use client"

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Users, Clock, Plus, Trash2Icon } from "lucide-react";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DeleteRoom, GetExistingRooms } from "@/services/room";
import { useRouter } from "next/navigation";
import CreateRoom from "../components/CreateRoom";
import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";

interface Room {
    id: string,
    slug: string,
    isActive: boolean,
    maxParticipants: number,
    createdAt: string
}



export default function Rooms() {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);

    const queryClient = useQueryClient();
    const { data: rooms, isLoading, error } = useQuery({
        queryKey: ["rooms"],
        queryFn: GetExistingRooms
    });

    // handle delete
    const deleteRoomMutation = useMutation({
        mutationFn: (roomId: string) => DeleteRoom(roomId),
        onSuccess: (data) => {
            toast.success("Success", {
                description: data.message,
                position: "top-center",
                style: {
                    background: "green",
                    color: "white"
                }
            });
            queryClient.invalidateQueries({
                queryKey: ["rooms"]
            })
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


    useEffect(() => {
        if (error) {
            toast.error("UnAuthorized", {
                description: "Please sign In again..",
                position: "top-center",
                style: {
                    background: "red",
                    color: "white"
                }
            })
            router.push('/auth');
        }
    }, [router, error]);


    const handleJoinRoom = (roomId: string) => {
        router.push(`/room/${roomId}`)
    };


    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return "Just now";
    };

    if (isLoading) {
        return (
            <p>Loading rooms....</p>
        )
    }

    const safeRooms = rooms ?? [];

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <Navbar auth={false} />
            {/* Main Content */}
            <main className="pt-24 px-12">
                <div className="container mx-auto px-4">

                    <CreateRoom open={modalOpen} onClose={() => setModalOpen(false)} />
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">My Rooms</h1>
                            <p className="text-muted-foreground">Join a room to start collaborating</p>
                        </div>
                        <Button
                            size="lg"
                            onClick={() => setModalOpen(true)}
                            className="gap-2"
                            variant={"canvas"}
                        >
                            <Plus className="w-5 h-5" />
                            Create Room
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {safeRooms.map((room: Room) => (
                            <Card key={room.id} className="hover:shadow-lg canvas-grid transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-xl">{room.slug}</CardTitle>
                                        <Badge variant={"secondary"}>
                                            <button
                                                disabled={deleteRoomMutation.isPending}
                                                onClick={() => deleteRoomMutation.mutate(room.id)}
                                                className="cursor-pointer"
                                            >
                                                <Trash2Icon className="w-4 h-4" /></button>
                                        </Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            Max Participants: {room.maxParticipants}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {getTimeAgo(room.createdAt)}
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        className="w-full"
                                        onClick={() => handleJoinRoom(room.id)}
                                        variant={"hero"}
                                    >
                                        Join Room
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {safeRooms.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg mb-4">No rooms yet</p>
                            <Button onClick={() => setModalOpen(true)}>Create Your First Room</Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
