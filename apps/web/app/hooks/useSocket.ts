import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WEBSOCKET_URL}?token=${localStorage.getItem("token")}`);

        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        loading,
        socket
    }
}