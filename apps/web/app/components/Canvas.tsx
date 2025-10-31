import React, { useEffect, useRef, useState } from "react";
import { initDraw } from "../../draw";
import { IconButton } from "./IconButton";
import { Circle, HandFist, HandGrab, Icon, Pen, Pencil, RectangleHorizontal } from "lucide-react";

type ShapeType = "rect" | "circle" | "line" | "hand";

interface Viewport {
    offsetX: number;
    offsetY: number;
    zoom: number;
}

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

    // Default viewport state for pan and zoom

    const [viewport, setViewport] = useState<Viewport>({
        offsetX: 0,
        offsetY: 0,
        zoom: 1
    });

    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<
        {
            x: number,
            y: number,
            offsetX: number,
            offsetY: number
        } | null>(null);

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

    useEffect(() => {

        if (canvasRef.current && canvasSize.width > 0) {
            const cleanup = initDraw(canvasRef.current, roomId, socket, selectedTool);
            return () => {
                if (cleanup) { cleanup(); }
            };
        }
    }, [selectedTool, socket, roomId, canvasSize.width, canvasSize.height]);

    //  Pan handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // Right click or middle click or space + drag
        if (e.button === 2 || e.button === 1 || e.ctrlKey) {
            e.preventDefault();
            setIsPanning(true);
            setPanStart({
                x: e.clientX,
                y: e.clientY,
                offsetX: viewport.offsetX,
                offsetY: viewport.offsetY
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPanning && panStart) {
            setViewport((prev) => ({
                ...prev,
                offsetX: panStart.offsetX + (e.clientX - panStart.x),
                offsetY: panStart.offsetY + (e.clientY - panStart.y)
            }));
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsPanning(false);
        setPanStart(null);
    }

    // Zoom handler
    const handleMouseWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Mouse pos in world coordinate before zoom
        const worldX = (mouseX - viewport.offsetX) / viewport.zoom;
        const worldY = (mouseY - viewport.offsetY) / viewport.zoom;

        // calculate new Zoom
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        const newZoom = Math.max(0.1, Math.min(viewport.zoom * zoomFactor, 10));

        // Adjust offset to keep world pos under mouse stable
        setViewport({
            offsetX: mouseX - worldX * newZoom,
            offsetY: mouseY - worldY * newZoom,
            zoom: newZoom
        });
    };

    // Disable context menu on right click
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    }

    return (
        <div ref={containerRef} className="h-screen">
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                // onMouseDown={handleMouseDown}
                // onMouseMove={handleMouseMove}
                // onMouseUp={handleMouseUp}
                // onMouseLeave={handleMouseUp}
                // onWheel={handleMouseWheel}
                // onContextMenu={handleContextMenu}
                // className={`${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
                className={`${selectedTool === "hand" ? 'cursor-grabbing' : 'cursor-crosshair'}`}
            />
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
            <IconButton
                activated={selectedTool === "hand"}
                icon={<HandGrab />}
                onClick={() => setSelectedTool("hand")}
            />
        </div>
    )
}