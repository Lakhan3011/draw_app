"use client"
import { useEffect, useRef } from "react"
import { initRect } from "../../../draw";

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasRef.current) {
            initRect(canvasRef.current);
        }
    }, [canvasRef])

    return (
        <div>
            <canvas ref={canvasRef} width={2000} height={1000}></canvas>
        </div>
    )
}