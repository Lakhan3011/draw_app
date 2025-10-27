import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WEBSOCKET_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZmZmYjU1Yy04OTJjLTQ0NWQtYTBiYS01OGM5MDQ5ZjU3NTkiLCJpYXQiOjE3NjE1NDg5MjcsImV4cCI6MTc2MTYzNTMyN30.SYVDLhKWni2ZUD2XgGpN6tt4VGhWd5SZ_VB4rt_M0cU`);

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