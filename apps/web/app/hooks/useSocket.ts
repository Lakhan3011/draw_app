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

    useEffect(() => {
        const wsURL = `${WEBSOCKET_URL}?` + `room=${roomId}` + `&token=${authToken ?? ""}` + `&invite=${inviteToken ?? ""}`;
        const ws = new WebSocket(wsURL);

        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }

        ws.onclose = () => {
            setLoading(true);
            setSocket(null);
        }

        return () => ws.close();
    }, [roomId, authToken, inviteToken]);

    return {
        loading,
        socket
    }
}