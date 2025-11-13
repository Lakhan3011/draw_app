import React, { useEffect, useRef, useState } from "react";
import { initDraw } from "@/draw";
import { IconButton } from "./IconButton";
import { Circle, HandGrab, Pencil, RectangleHorizontal } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";

type ShapeType = "rect" | "circle" | "line" | "hand";

export function Canvas({ roomId, socket }: {
    roomId: string;
    socket: WebSocket
}) {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedTool, setSelectedTool] = useState<ShapeType>('rect');
    const [userCount, setUserCount] = useState(0);
    const [canvasSize, setCanvasSize] = useState({
        width: 0,
        height: 0
    });

    useEffect(() => {
        const updateCanvasSize = () => {
            if (containerRef.current) {
                const width = window.innerWidth;
                const height = window.innerHeight;
                setCanvasSize({ width, height });
            }
        };

        // Initial default canvas size
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        }

    }, []);


    // Handle socket messages for user count
    useEffect(() => {
        const handleSocketUserCount = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === "user_count") {
                setUserCount(data.count);
            }
        };
        socket.addEventListener('message', handleSocketUserCount);
        return () => socket.removeEventListener('message', handleSocketUserCount);
    }, [socket]);


    // Initailize drawing logic
    useEffect(() => {
        if (canvasRef.current && canvasSize.width > 0) {
            const cleanup = initDraw(canvasRef.current, roomId, socket, selectedTool);
            return () => {
                if (cleanup) { cleanup(); }
            };
        }
    }, [selectedTool, socket, roomId, canvasSize.width, canvasSize.height]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push('/');
    }

    return (
        <div ref={containerRef} className="h-screen">
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className={`${selectedTool === "hand" ? 'cursor-grabbing' : 'cursor-crosshair'}`}
            />
            <TopBar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
            <div className="fixed top-4 right-2 flex items-center gap-5 z-50">
                <Button
                    variant={"ghost"}
                    onClick={() => router.push('/existing-rooms')}
                >My Rooms</Button>
                <Button
                    variant={"destructive"}
                    onClick={handleLogout}
                >Log Out</Button>
            </div>

            {/* Floating user count */}
            <div className="absolute top-4 left-4 bg-gray-800/90 text-white px-4 py-2 rounded-lg text-sm shadow-md">
                <span> 👥 {userCount} {userCount === 1 ? "user" : "users"} online </span>
            </div>
        </div>
    )
}

function TopBar({ selectedTool, setSelectedTool }: {
    selectedTool: ShapeType,
    setSelectedTool: (s: ShapeType) => void
}) {
    return (
        <div>
            <div className="fixed top-4 left-1/2 -translate-x-1/2  flex items-center justify-center px-4 py-2 gap-3 rounded-xl shadow-lg bg-gray-800/90 backdrop-blur-md border border-white/10 z-50">
                <IconButton
                    activated={selectedTool === "line"}
                    icon={<Pencil />}
                    onClick={() => { setSelectedTool("line") }}
                />
                <IconButton
                    activated={selectedTool === "rect"}
                    icon={<RectangleHorizontal />}
                    onClick={() => { setSelectedTool("rect") }}
                />
                <IconButton
                    activated={selectedTool === "circle"}
                    icon={<Circle />}
                    onClick={() => { setSelectedTool("circle") }}
                />
                <IconButton
                    activated={selectedTool === "hand"}
                    icon={<HandGrab />}
                    onClick={() => setSelectedTool("hand")}
                />
            </div>
        </div>
    )
}