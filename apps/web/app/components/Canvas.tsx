import { useEffect, useRef, useState } from "react";
import { initDraw } from "../../draw";
import { IconButton } from "./IconButton";
import { Circle, Icon, Pencil, RectangleHorizontal } from "lucide-react";

type ShapeType = "rect" | "circle" | "line";

export function Canvas({ roomId, socket }: {
    roomId: string;
    socket: WebSocket
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedTool, setSelectedTool] = useState<ShapeType>('rect');
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

        // Initial default size
        updateCanvasSize();

        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        }

    }, []);

    useEffect(() => {
        if (canvasRef.current && canvasSize.width > 0) {
            initDraw(canvasRef.current, roomId, socket, selectedTool);
        }
    }, [canvasRef, selectedTool, socket, roomId, canvasSize]);

    return (
        <div ref={containerRef} className="h-screen">
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}></canvas>
            <TopBar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
        </div>
    )
}

function TopBar({ selectedTool, setSelectedTool }: {
    selectedTool: ShapeType,
    setSelectedTool: (s: ShapeType) => void
}) {
    return (
        <div className="fixed top-3 right-1 flex flex-col p-2 gap-3 rounded-lg bg-gray-800">
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
        </div>
    )
}