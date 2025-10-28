import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WEBSOCKET_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZmZmYjU1Yy04OTJjLTQ0NWQtYTBiYS01OGM5MDQ5ZjU3NTkiLCJpYXQiOjE3NjE2MzU0MDksImV4cCI6MTc2MTcyMTgwOX0.XD9hwFTGJGyJMR23xl3Wdc9R_U4tCQ0gdAEl1OGyhq0`);

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