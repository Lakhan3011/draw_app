import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WEBSOCKET_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiYjI0ODYyNi1iOTVjLTRmMTQtOGQzZS0zY2MyZDcwOTRiYzYiLCJpYXQiOjE3NjE5MjcyNzh9.IPRBZjHsicgxsKiStm_qokhIZVVdpeuiFvqhiFNzrAc`);

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