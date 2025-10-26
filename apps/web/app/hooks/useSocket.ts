import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../config/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WEBSOCKET_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZmZmYjU1Yy04OTJjLTQ0NWQtYTBiYS01OGM5MDQ5ZjU3NTkiLCJpYXQiOjE3NjE0NjQ5ODAsImV4cCI6MTc2MTUwMDk4MH0.6ybbLdLgtsgG1OobEmAa_X2lkYmG3dp9x8wsJ34oZ5Y`);

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