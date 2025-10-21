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

    useEffect(() => {
        if (!socket || loading) { return }

        socket.send(JSON.stringify({
            type: "join",
            roomId: id
        }));

        // TODO: check the message is sent from correct roomId only
        const handleMessage = (event: MessageEvent) => {
            const parsedData = JSON.parse(event.data);
            if (parsedData.type === "chat") {
                console.log("Received: ", parsedData);
                setChats(c => [...c, { message: parsedData.message }])
            }
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.send(JSON.stringify({
                type: "leave",
                roomId: id
            }));

            socket.removeEventListener("message", handleMessage);
        };
    }, [socket, loading, id]);

    return (
        <div className="h-screen w-screen flex flex-col justify-between">
            <div className="border-2 p-2 m-2 text-center font-light">
                {chats.map((c, i) => (
                    <div key={i}>{c.message}</div>
                ))}
            </div>
            <div className="flex justify-between">
                <input
                    className="border-2 flex-1 outline-none"
                    type="text"
                    value={currentmsg}
                    onChange={(e) => SetCurrentMsg(e.target.value)}
                />

                <button
                    className="bg-purple-600  cursor-pointer p-2"
                    onClick={() => {
                        socket?.send(JSON.stringify({
                            type: "chat",
                            message: currentmsg,
                            roomId: id
                        }))

                        SetCurrentMsg("");
                    }}
                >Send Message</button>
            </div>
        </div>
    )
}