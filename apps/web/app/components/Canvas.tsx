import { useEffect, useRef, useState } from "react";
import { initDraw } from "../../draw";

type ShapeType = "rect" | "circle" | "line";

export function Canvas({ roomId, socket }: {
    roomId: string;
    socket: WebSocket
}) {

    const [tool, setTool] = useState<ShapeType>('rect');
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current, roomId, socket, tool);
        }
    }, [canvasRef, tool]);

    return (
        <div>
            <canvas ref={canvasRef} width={2000} height={1000}></canvas>
            <div className="flex justify-center gap-4 p-2">
                <button
                    onClick={() => setTool("rect")}
                    className={`p-2 rounded cursor-pointer ${tool === "rect" ? "bg-red-600 ring-2 ring-black" : "bg-red-400"}`}>
                    Rect
                </button>
                <button
                    onClick={() => setTool("circle")}
                    className={`p-2 rounded cursor-pointer ${tool === "circle" ? "bg-blue-600 ring-2 ring-black" : "bg-blue-400"}`}>
                    Circle
                </button>
                <button
                    onClick={() => setTool("line")}
                    className={`p-2 rounded cursor-pointer ${tool === "line" ? "bg-gray-600 ring-2 ring-black" : "bg-gray-400"}`}>
                    line
                </button>
            </div>
        </div>
    )
}