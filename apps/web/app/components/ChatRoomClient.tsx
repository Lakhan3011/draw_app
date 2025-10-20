"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket"

export function ChatRoomClient({ id, messages }: {
    messages: { message: string }[],
    id: string
}) {
    const [chats, setChats] = useState(messages);
    const [currentmsg, SetCurrentMsg] = useState("");
    const { socket, loading } = useSocket();

    if (socket && !loading) {
        useEffect(() => {
            socket.send(JSON.stringify({
                type: "join",
                roomId: id
            }));
            // TODO: ,essage in sent in current room only
            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === "chat") {
                    setChats(c => [...c, { message: parsedData.message }])
                }
            }
        }, [socket, loading, id])
    }

    return (
        <div>
            <div>
                {chats.map(c => (
                    <div>{c.message}</div>
                ))}
            </div>
            <input
                type="text"
                value={currentmsg}
                onChange={(e) => SetCurrentMsg(e.target.value)}
            />

            <button
                onClick={() => {
                    socket?.send(JSON.stringify({
                        type: "chat",
                        message: currentmsg,
                        roomId: id
                    }))
                }}
            >Send Message</button>
        </div>
    )
}