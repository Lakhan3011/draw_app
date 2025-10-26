import axios from "axios";
import { BACKEND_URL } from "../app/config/config";
import { parse } from "path";

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

type ToolType = "rect" | "circle" | "line";

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, currentTool: ToolType) {

    let existingShapes: Shape[] = await getExistingShapes(roomId);
    // console.log('existing shape: ', existingShapes);

    const ctx = canvas.getContext('2d');
    if (!ctx) { return; }

    // Message event handler
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        //TODO:  If I'm drawing my self and someone added the shape, than my shape go away , I have to re-move the mouse
        if (message.type === "chat") {
            const parsedShape = JSON.parse(message.message);
            // console.log(parsedShape);
            existingShapes.push(parsedShape.shape);
            clearCanvas(existingShapes, canvas, ctx);
        }
    }

    // Bydefault: rect is black
    clearCanvas(existingShapes, canvas, ctx);

    let startX = 0;
    let startY = 0;
    let clicked = false;

    canvas.addEventListener('mousedown', (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    })

    canvas.addEventListener('mouseup', (e) => {
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;

        const shape: Shape = {
            type: "rect",
            x: startX,
            y: startY,
            width,
            height
        }

        existingShapes.push(shape);
        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId
        }))
    })

    canvas.addEventListener('mousemove', (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            clearCanvas(existingShapes, canvas, ctx);
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.strokeRect(startX, startY, width, height);
        }
    })
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.map((shape) => {
        if (shape.type === "rect") {
            ctx.strokeStyle = "white";
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    })
}


// TODO: Infinite scrolling

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    const messages = res.data.chats;

    const shapes = messages.map((x: { message: string }) => {
        const messageData = JSON.parse(x.message);
        // console.log('MESSAGE DATA IS: ', messageData.shape);
        return messageData.shape;
    });

    return shapes;
}