import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        if (!decoded || !decoded.userId) {
            return null;
        }

        return decoded.userId;
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            console.warn('JWT Expired: ', error.message);
        } else {
            console.warn('JWT Invalid: ', error.message);
        }
        return null;
    }
}


wss.on('connection', (socket, req) => {
    console.log('Client connected');
    const url = req.url;
    if (!url) {
        return null;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get("token") || "";

    const userId = checkUser(token);
    if (userId === null) {
        socket.close();
        return;
    }

    users.push({
        userId,
        socket,
        rooms: []
    })

    socket.on('message', async (message) => {
        const parsedData = JSON.parse(message as unknown as string);

        // TODO: Does this roomID exists in db 
        // Does this person has access to join this specific room
        if (parsedData.type === "join_room") {
            const user = users.find(x => x.socket === socket);
            if (!user) {
                return;
            }
            const roomId = parsedData.roomId;
            if (!user.rooms.includes(roomId)) {
                user.rooms.push(roomId);
                console.log(`${user.userId} joins the room ${roomId}`);
            }
        }

        if (parsedData.type === "leave_room") {
            const user = users.find(x => x.socket === socket);
            if (!user) return null;
            user.rooms = user?.rooms.filter(room => room !== parsedData.roomId);
            console.log(`${user.userId} left room ${parsedData.roomId}`)
        }

        // TODO: Rate limit msg not too long
        // Auth: now anyone sends msg to any room, if one subs to room1, he mays sends msg to room2
        if (parsedData.type === "chat") {
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            await prisma.chat.create({
                data: {
                    roomId,
                    userId,
                    message
                }
            })

            console.log(`Message to room ${roomId} is ${message}`)

            users.forEach(user => {
                if (user.rooms.includes(roomId)) {
                    user.socket.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })
        }
    })
})