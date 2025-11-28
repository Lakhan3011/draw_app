import axios from "axios";
import { BACKEND_URL } from "../app/config/config";
import { LiveCursors } from "@/app/components/Canvas";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centreX: number;
    centreY: number;
    radius: number;
} | {
    type: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

type ToolType = "rect" | "circle" | "line" | "hand";
type Viewport = {
    offsetX: number;
    offsetY: number;
    zoom: number;
}

function screenToWorld(px: number, py: number, vp: Viewport) {
    return {
        x: (px - vp.offsetX) / vp.zoom,
        y: (py - vp.offsetY) / vp.zoom
    };
}


export function initDraw(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    currentTool: ToolType,
    liveCursorsRef: React.RefObject<LiveCursors>,
    myColorRef: React.RefObject<string>,
    role: "viewer" | "editor",
) {

    const ctx = canvas.getContext('2d');
    if (!ctx) { return () => { }; }

    let existingShapes: Shape[] = [];
    let drawingShape: Shape | null = null;


    // Default viewport state for pan and zoom
    const viewport: Viewport = {
        offsetX: 0,
        offsetY: 0,
        zoom: 1
    };

    // Default mouse state that tracks mouse position in screen and world coordinates
    const mouse = {
        screenX: 0,
        screenY: 0,
        worldX: 0,
        worldY: 0
    }

    // Default pan state
    let isPanning = false;
    let panStart = {
        x: 0,
        y: 0
    };

    // Default draw state
    let isDrawing = false;
    let startX = 0;
    let startY = 0;


    // throttle cursor sends (50ms)
    let lastSent = 0;
    const sendCursorIfNeeded = () => {
        const now = Date.now();
        if (now - lastSent < 50) return;
        lastSent = now;
        // send world coords
        socket.send(JSON.stringify({
            type: "cursor_move",
            roomId,
            x: mouse.worldX,
            y: mouse.worldY,
            color: myColorRef?.current
        }));
    };


    // Fetch old shapes
    getExistingShapes(roomId).then((shapes) => {
        existingShapes = shapes;
    });


    // Socket message event handler
    const onMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.type === "chat") {
            const parsedShape = JSON.parse(message.message);
            existingShapes.push(parsedShape.shape);

        }
    };
    socket.addEventListener('message', onMessage);



    // Mouse event handlers
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    const onMouseDown = (e: MouseEvent) => {
        // if (role === "viewer") return;
        const rect = canvas.getBoundingClientRect();

        // right click - pan
        if (e.button === 2 || e.button === 1 || e.ctrlKey || currentTool === "hand" || role === "viewer") {
            isPanning = true;
            panStart.x = e.clientX;
            panStart.y = e.clientY;
            return;
        }

        // left click - draw shapes
        isDrawing = true;
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const world = screenToWorld(px, py, viewport);
        startX = world.x;
        startY = world.y;
    };

    const onMouseUp = (e: MouseEvent) => {
        if (isPanning) {
            isPanning = false;
            return;
        }
        if (isDrawing && drawingShape) {
            existingShapes.push(drawingShape);
            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape: drawingShape }),
                roomId,
            })
            );
        }

        isDrawing = false;
        drawingShape = null;
    }

    const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();

        // update mouse position (screen + world)
        mouse.screenX = e.clientX - rect.left;
        mouse.screenY = e.clientY - rect.top;
        const { x, y } = screenToWorld(mouse.screenX, mouse.screenY, viewport);
        mouse.worldX = x;
        mouse.worldY = y;

        if (isPanning) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            viewport.offsetX += dx;
            viewport.offsetY += dy;
            panStart.x = e.clientX;
            panStart.y = e.clientY;
            return;
        }

        // send live cursor updates
        if (!isDrawing && !isPanning) {
            sendCursorIfNeeded();
        }
    };

    // zoom handler
    const onWheel = (e: WheelEvent) => {
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldBeforeZoom = screenToWorld(mouseX, mouseY, viewport);

        // calculate new Zoom
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const newZoom = Math.max(0.1, Math.min(viewport.zoom * zoomFactor, 10));

        // Adjust offset to keep world pos under mouse stable
        viewport.offsetX = mouseX - worldBeforeZoom.x * newZoom;
        viewport.offsetY = mouseY - worldBeforeZoom.y * newZoom;
        viewport.zoom = newZoom;


    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel);



    // Render loop
    let frameId: number;

    function render() {
        if (!ctx) return;

        // Clear + background
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // apply world transform
        ctx.save();
        ctx.setTransform(viewport.zoom, 0, 0, viewport.zoom, viewport.offsetX, viewport.offsetY);

        // Reacalculate shape in render loop for stable preview
        if (isDrawing && currentTool !== "hand") {
            const { worldX, worldY } = mouse;

            switch (currentTool) {
                case "rect":
                    drawingShape = {
                        type: "rect",
                        x: startX,
                        y: startY,
                        width: worldX - startX,
                        height: worldY - startY,
                    };
                    break;

                case "circle":
                    drawingShape = {
                        type: "circle",
                        centreX: startX,
                        centreY: startY,
                        radius: Math.hypot(worldX - startX, worldY - startY),
                    };
                    break;

                case "line":
                    drawingShape = {
                        type: "line",
                        startX,
                        startY,
                        endX: worldX,
                        endY: worldY,
                    };
                    break;
            }
        }

        // draw all saved shapes
        existingShapes.forEach((shape) => drawShape(shape, ctx, viewport));

        // current preview shape while drawing
        if (isDrawing && drawingShape) {
            ctx.save();
            ctx.strokeStyle = "rgba(255,255,255, 0.8)";
            ctx.lineWidth = 2 / viewport.zoom;
            drawShape(drawingShape, ctx, viewport);
            ctx.restore();
        }

        // Draw remote cursors — world coords (read from ref)
        const live = liveCursorsRef?.current ?? {};

        if (live) {
            Object.entries(live).forEach(([userId, cursor]) => {
                ctx.save();

                ctx.fillStyle = cursor.color || "white";
                ctx.strokeStyle = cursor.color || "white";
                ctx.lineWidth = 2 / viewport.zoom;

                // cursor circle
                ctx.beginPath();
                ctx.arc(cursor.x, cursor.y, 6 / viewport.zoom, 0, Math.PI * 2);
                ctx.fill();

                // Username tag
                ctx.font = `${12 / viewport.zoom}px monospace`;
                ctx.fillStyle = "white";
                ctx.fillText(userId, cursor.x + 8 / viewport.zoom, cursor.y - 10 / viewport.zoom);
                ctx.restore();
            });
        }

        // showing mouse pos on canvas
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = `${12 / viewport.zoom}px monospace`
        ctx.fillText(
            `Mouse: (${mouse.worldX.toFixed(1)}, ${mouse.worldY.toFixed(1)})`,
            mouse.worldX + 10,
            mouse.worldY + 10
        );
        ctx.restore();


        ctx.restore();
        frameId = requestAnimationFrame(render);
    }

    frameId = requestAnimationFrame(render);

    // Cleanup Fn
    return () => {
        cancelAnimationFrame(frameId);
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('mousedown', onMouseMove);
        canvas.removeEventListener('wheel', onWheel);
        socket.removeEventListener('message', onMessage);
    };
}

// Helper functions

function drawShape(shape: Shape, ctx: CanvasRenderingContext2D, viewport: Viewport) {
    // draw shape preview
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2 / viewport.zoom;  // for stable width

    switch (shape.type) {
        case "rect":
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            break;

        case "circle":
            ctx.beginPath();
            ctx.arc(shape.centreX, shape.centreY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
            break;

        case "line":
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();
            break;
    }
}



async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    const messages = res.data.chats;

    const shapes = messages.map((x: { message: string }) => {
        const messageData = JSON.parse(x.message);
        return messageData.shape;
    });

    return shapes;
}

