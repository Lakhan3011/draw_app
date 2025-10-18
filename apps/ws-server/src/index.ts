import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket,
    // rooms: string[],
    userId: string
}

const rooms = new Map<string, Set<User>>();

// const users: User[] = [];

function joinRoom(roomId: string, user: User) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    };
    rooms.get(roomId)!.add(user);
}

function leaveRoom(roomId: string, user: User) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.delete(user);

    if (room.size === 0) {
        rooms.delete(roomId);
    }
}

function broadcast(roomId: string, message: any) {
    const room = rooms.get(roomId);
    if (!room) return;

    for (const user of room) {
        if (user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify(message));
        }
    }
}

function getUserCount(roomId: string) {
    return rooms.get(roomId)?.size || 0;
}

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


    let currentRoom: string = "";
    let currentUser: User | null = null;

    socket.on('message', async (message) => {
        const parsedData = JSON.parse(message.toString());

        // TODO: Does this roomID exists in db 
        // Does this person has access to join this specific room
        if (parsedData.type === "join") {
            currentRoom = parsedData.roomId;
            currentUser = { socket, userId };

            joinRoom(currentRoom, currentUser);

            // Notify to new user
            socket.send(
                JSON.stringify({
                    type: "system",
                    message: `Welcome ${userId}, you joined room ${currentRoom}`,
                    users: getUserCount(currentRoom)
                })
            )

            // Notify to others
            broadcast(currentRoom, JSON.stringify({
                type: "system",
                message: `${userId} joined room ${currentRoom}`,
                users: getUserCount(currentRoom)
            }))
        }

        if (parsedData.type === "leave") {
            if (!currentUser) { return };
            leaveRoom(currentRoom, currentUser);

            broadcast(currentRoom, JSON.stringify({
                type: "system",
                message: `${currentUser.userId} has left the room ${currentRoom}`,
                users: getUserCount(currentRoom)
            }))
        }


        // TODO: Rate limit msg not too long
        // Auth: now anyone sends msg to any room, if one subs to room1, he mays sends msg to room2
        if (parsedData.type === "chat" && currentRoom && currentUser) {
            const msg = {
                type: "chat",
                room: currentRoom,
                user: currentUser.userId,
                message: parsedData.message,
            };

            await prisma.chat.create({
                data: {
                    roomId: Number(currentRoom),
                    userId: currentUser.userId,
                    message: parsedData.message
                }
            })

            broadcast(currentRoom, msg);
        }
    })
})