import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WEBSOCKET_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiYjI0ODYyNi1iOTVjLTRmMTQtOGQzZS0zY2MyZDcwOTRiYzYiLCJpYXQiOjE3NjE4NDE0NDQsImV4cCI6MTc2MTkyNzg0NH0.xZbvv32ueiQWICoDNjZbpFwYliepRAA1rp3Soxf1nY4`);

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