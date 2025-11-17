"use client"
import { useEffect } from "react"
import { useSocket } from "../hooks/useSocket";
import { Canvas } from "./Canvas";
import { Button } from "@repo/ui/components/ui/button";

export function RoomCanvas({ roomId }: { roomId: string }) {

    const { socket, loading } = useSocket();

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
        <div>
            <Canvas roomId={roomId} socket={socket} />
        </div>
    )
}