import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket,
    userId: string,
    color?: string
}

const rooms = new Map<string, Set<User>>();


function joinRoom(roomId: string, user: User) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    };
    rooms.get(roomId)!.add(user);
    broadCastUserCount(roomId);
}

function leaveRoom(roomId: string, user: User) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.delete(user);

    if (room.size === 0) {
        rooms.delete(roomId);
    }
    broadCastUserCount(roomId);
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

// Broadcast the updates user count
function broadCastUserCount(roomId: string) {
    const count = getUserCount(roomId);
    broadcast(roomId, {
        type: "user_count",
        roomId,
        count
    });
}

function getUserCount(roomId: string) {
    return rooms.get(roomId)?.size || 0;
}

// Verify JWT
function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded?.userId ?? null;
    } catch (error: any) {
        console.warn("JWT Error :", error.message);
        return null;
    }
}


wss.on('connection', (socket, req) => {
    // console.log('Client connected');
    const url = req.url;
    if (!url) {
        socket.close();
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get("token") || "";
    const userId = checkUser(token);

    if (!userId) {
        socket.close();
        return;
    }


    let currentRoom = "";
    let currentUser: User | null = null;

    socket.on('message', async (message) => {
        const parsedData = JSON.parse(message.toString());

        // Does this person has access to join this specific room
        if (parsedData.type === "join") {
            currentRoom = parsedData.roomId;
            const color = parsedData.color || `hsl(${Math.floor(Math.random() * 360)},70%, 60%)`;
            currentUser = { socket, userId, color };

            const roomSize = getUserCount(currentRoom);

            // check if resective room exists in DB
            const dbRoom = await prisma.room.findUnique({
                where: {
                    id: Number(currentRoom)
                }
            });

            if (!dbRoom) {
                socket.send(JSON.stringify({
                    type: "room error",
                    message: "Room does not exist"
                }));
                socket.close();
                return;
            }

            // check room size for max participants
            if (roomSize >= dbRoom.maxParticipants) {
                socket.send(JSON.stringify({
                    type: "room_full",
                    message: "Room is full. Please create another one"
                }));
                socket.close();
                return;
            }

            // Now add user 
            joinRoom(currentRoom, currentUser);

            const updatedCount = getUserCount(currentRoom);

            // Notify to new user
            socket.send(
                JSON.stringify({
                    type: "system",
                    message: `Welcome ${userId}, you joined room ${currentRoom}`,
                    users: updatedCount,
                    yourColor: color,
                    yourUserId: userId
                })
            )

            // Notify to others
            broadcast(currentRoom, {
                type: "User_count",
                message: `${userId} joined room ${currentRoom}`,
                users: updatedCount,
                isFull: updatedCount >= dbRoom.maxParticipants
            });
        }

        if (parsedData.type === "cursor_move" && currentRoom && currentUser) {
            broadcast(currentRoom, {
                type: "cursor_move",
                userId: currentUser.userId,
                x: parsedData.x,
                y: parsedData.y,
                color: currentUser.color
            });
            return;
        }

        if (parsedData.type === "leave" && currentUser) {
            leaveRoom(currentRoom, currentUser);

            broadcast(currentRoom, {
                type: "system",
                message: `${currentUser.userId} has left the room ${currentRoom}`,
                users: getUserCount(currentRoom),
                userId
            });

            return;
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
                },
            });

            broadcast(currentRoom, msg);
        }
    });

    // Handle socket disconnection
    socket.on("close", () => {
        if (currentUser && currentRoom) {
            console.log(`User ${currentUser.userId} disconnected from ${currentRoom}`)
            leaveRoom(currentRoom, currentUser);
        }
    });
})