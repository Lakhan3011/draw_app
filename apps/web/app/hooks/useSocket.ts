import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${WEBSOCKET_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZmZmYjU1Yy04OTJjLTQ0NWQtYTBiYS01OGM5MDQ5ZjU3NTkiLCJpYXQiOjE3NjEwMzExMjksImV4cCI6MTc2MTA2NzEyOX0.RTbK4w2grSTBYEvyb3ixUTVR8NhqdPg5USHgvNh3tH4`);

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