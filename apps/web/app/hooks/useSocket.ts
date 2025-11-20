import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config/config";

interface UseSocketParams {
    roomId: string;
    authToken?: string | null;
    inviteToken?: string | null;
}

export function useSocket({ roomId, authToken, inviteToken }: UseSocketParams) {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [role, setRole] = useState<"viewer" | "editor">("viewer");

    useEffect(() => {
        if (!roomId) return;

        const wsURL = `${WEBSOCKET_URL}?` + `room=${roomId}` + `&token=${authToken ?? ""}` + `&invite=${inviteToken ?? ""}`;
        console.log(wsURL);
        const ws = new WebSocket(wsURL);

        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }

        ws.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data);
                if (data.type === "system" && data.role) {
                    setRole(data.role);
                }
            } catch (error) {
                console.error(error);
            }
        };

        ws.onclose = () => {
            setLoading(true);
            setSocket(null);
        }

        return () => ws.close();
    }, [roomId, authToken, inviteToken]);

    return {
        loading,
        socket,
        role
    }
}