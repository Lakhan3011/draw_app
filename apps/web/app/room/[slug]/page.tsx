"use client"
import { Canvas } from "@/app/components/Canvas";
import { RoomCanvas } from "@/app/components/RoomCanvas";
import { useSocket } from "@/app/hooks/useSocket";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Room({ params }: {
    params: Promise<{ slug: string }>
}) {
    const roomId = React.use(params).slug;
    const search = useSearchParams();
    const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const inviteToken = search.get("token") || null;


    const { socket, loading } = useSocket({
        roomId,
        authToken,
        inviteToken
    });

    console.log('roomId is:', roomId);


    useEffect(() => {
        if (socket && loading) {
            return;
        }
        socket?.send(JSON.stringify({
            type: "join",
            roomId
        }))
    }, [socket, loading, roomId]);


    if (!socket) {
        return <div>
            connecting to the server ....
        </div>
    }

    return (
        <div className="bg-black w-screen h-screen flex flex-col justify-between text-white">
            <Canvas
                roomId={roomId}
                socket={socket}
            />
        </div>
    )
}