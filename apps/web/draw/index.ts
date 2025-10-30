import axios from "axios";
import { BACKEND_URL } from "../app/config/config";
import { clear } from "console";
import { channel } from "diagnostics_channel";
import { start } from "repl";

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

interface Viewport {
    offsetX: number,
    offsetY: number,
    zoom: number
}

export function initDraw(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    currentTool: ToolType
) {

    let existingShapes: Shape[] = [];

    // return setUpCanvas(canvas, roomId, socket, currentTool, existingShapes);
    getExistingShapes(roomId).then((shapes) => {
        existingShapes = shapes;
        const ctx = canvas.getContext('2d');
        clearCanvas(existingShapes, canvas, ctx!);
    });
    // console.log('existing shape: ', existingShapes);

    const ctx = canvas.getContext('2d');
    if (!ctx) { return; }

    // Message event handler
    const onMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        //TODO:  If I'm drawing my self and someone added the shape, than my shape go away , I have to re-move the mouse
        if (message.type === "chat") {
            const parsedShape = JSON.parse(message.message);
            // console.log(parsedShape);
            existingShapes.push(parsedShape.shape);
            clearCanvas(existingShapes, canvas, ctx);
        }
    }

    socket.addEventListener('message', onMessage);

    // Bydefault: rect is black
    clearCanvas(existingShapes, canvas, ctx);

    let startX = 0;
    let startY = 0;
    let clicked = false;

    const onMouseDown = (e: MouseEvent) => {
        clicked = true;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
    }

    const onMouseUp = (e: MouseEvent) => {
        clicked = false;
        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        let shape: Shape;

        // create shape based on selection tool
        switch (currentTool) {
            case 'rect':
                shape = {
                    type: "rect",
                    x: startX,
                    y: startY,
                    width: endX - startX,
                    height: endY - startY
                };
                break;

            case "circle":
                const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                shape = {
                    type: "circle",
                    radius,
                    centreX: startX,
                    centreY: startY
                };
                break;

            case "line":
                shape = {
                    type: "line",
                    startX,
                    startY,
                    endX,
                    endY
                }
                break;
        }

        existingShapes.push(shape);
        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId
        }))
    };

    const onMouseMove = (e: MouseEvent) => {
        if (clicked) {
            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            clearCanvas(existingShapes, canvas, ctx);
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.lineWidth = 2;

            // shape preview 
            switch (currentTool) {
                case "rect":
                    ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
                    break;

                case "circle":
                    const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    break;

                case "line":
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(currentX, currentY);
                    ctx.stroke();
                    break;
            }
        }
    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);

    return () => {
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('mousedown', onMouseMove);
        socket.removeEventListener('message', onMessage);
    }
}

// function setUpCanvas(
//     canvas: HTMLCanvasElement,
//     roomId: string,
//     socket: WebSocket,
//     currentTool: ToolType,
//     existingShapes: Shape[]
// ) {
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return ({});



//     // Message Event handler
//     const onMessage = (event: MessageEvent) => {
//         const message = JSON.parse(event.data);
//         //TODO:  If I'm drawing my self and someone added the shape, than my shape go away , I have to re-move the mouse
//         if (message.type === "chat") {
//             const parsedShape = JSON.parse(message.message);
//             existingShapes.push(parsedShape.shape);
//             clearCanvas(existingShapes, canvas, ctx);
//         };
//     };

//     socket.addEventListener('message', onMessage);
//     // Iitial render
//     clearCanvas(existingShapes, canvas, ctx);


//     let clicked = false;
//     let startX = 0;
//     let startY = 0;

//     const onMouseDown = (e: MouseEvent) => {
//         clicked = true;
//         const rect = canvas.getBoundingClientRect();
//         startX = e.clientX - rect.left;
//         startY = e.clientY - rect.top;
//     }

//     const onMouseUp = (e: MouseEvent) => {
//         clicked = false;
//         const rect = canvas.getBoundingClientRect();
//         const endX = e.clientX - rect.left;
//         const endY = e.clientY - rect.top;

//         let shape: Shape;

//         // Create shape based on current tool
//         switch (currentTool) {
//             case "rect":
//                 shape = {
//                     type: "rect",
//                     x: startX,
//                     y: startY,
//                     width: endX - startX,
//                     height: endY - startY
//                 };
//                 break;

//             case "circle":
//                 const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
//                 shape = {
//                     type: "circle",
//                     centreX: startX,
//                     centreY: startY,
//                     radius
//                 };
//                 break;

//             case "line":
//                 shape = {
//                     type: "line",
//                     startX,
//                     startY,
//                     endX,
//                     endY
//                 };
//                 break;
//         }

//         existingShapes.push(shape);
//         socket.send(JSON.stringify({
//             type: "chat",
//             message: JSON.stringify({ shape }),
//             roomId
//         }))
//     }

//     const onMouseMove = (e: MouseEvent) => {
//         if (clicked) {
//             const rect = canvas.getBoundingClientRect();
//             const currentX = e.clientX - rect.left;
//             const currentY = e.clientY - rect.top;

//             clearCanvas(existingShapes, canvas, ctx);
//             ctx.strokeStyle = "rgba(255,255,255,0.8)"
//             ctx.lineWidth = 2;

//             switch (currentTool) {
//                 case 'rect':
//                     ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
//                     break;

//                 case "circle":
//                     const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
//                     ctx.beginPath();
//                     ctx.arc(startX, startY, radius, 0, Math.PI * 2);
//                     ctx.stroke();
//                     break;

//                 case "line":
//                     ctx.beginPath()
//                     ctx.lineTo(startX, startY);
//                     ctx.moveTo(currentX, currentY);
//                     ctx.stroke();
//                     break;
//             }
//         };
//     };



//     canvas.addEventListener('mousedown', onMouseDown);
//     canvas.addEventListener('mouseup', onMouseUp);
//     canvas.addEventListener('mousemove', onMouseMove);

//     return () => {
//         canvas.removeEventListener('mousedown', onMouseDown);
//         canvas.removeEventListener('mouseup', onMouseUp);
//         canvas.removeEventListener('mousemove', onMouseMove);
//         socket.removeEventListener('message', onMessage);
//     };
// };

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    existingShapes.forEach((shape) => {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
        else if (shape.type === "circle") {
            ctx.beginPath();
            ctx.arc(shape.centreX, shape.centreY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        else if (shape.type === "line") {
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();
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