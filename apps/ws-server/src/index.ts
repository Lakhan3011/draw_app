import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket,
    userId: string,
    color?: string,
    role?: string
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

// verify invite token
function verifyInvite(inviteToken: string) {
    try {
        const payload = jwt.verify(inviteToken, JWT_SECRET) as any;
        if (!payload || !payload.roomId || !payload.perm) return null;
        if (!["view", "edit"].includes(payload.perm)) return null;
        return { roomId: String(payload.roomId), perm: payload.perm };
    } catch (error) {
        return null;
    }
}


wss.on('connection', (socket, req) => {
    // console.log('Client connected');

    const url = req.url || "";
    if (!url) {
        socket.close();
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1] || "");
    const authtoken = queryParams.get("token") || "";
    const inviteToken = queryParams.get("invite") || "";

    const authUserId = checkUser(authtoken);
    const invite = inviteToken ? verifyInvite(inviteToken) : null;

    if (!authUserId) {
        socket.close();
        return;
    }

    // if invite exists, be sure it matches intended room on join event later
    let currentRoom = "";
    let currentUser: User | null = null as (User & { role?: "viewer" | "editor" }) | null;

    socket.on('message', async (message) => {
        const parsedData = JSON.parse(message.toString());

        // Does this person has access to join this specific room
        if (parsedData.type === "join") {
            currentRoom = String(parsedData.roomId);

            // if invite given, assert room matches and set the role
            if (invite) {
                if (invite?.roomId !== currentRoom) {
                    socket.send(JSON.stringify({
                        type: "error",
                        message: "Invite does not match room"
                    }));
                    socket.close();
                    return;
                }
            }

            // ownership
            const role = invite ? (invite.perm === "view" ? "viewer" : "editor") : "editor";

            const color = parsedData.color || `hsl(${Math.floor(Math.random() * 360)},70%, 60%)`;
            currentUser = { socket, userId: authUserId || `anon_${Math.random().toString(36).slice(2, 8)}`, color, role };

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
                    message: `Welcome,  you joined room ${currentRoom}`,
                    users: updatedCount,
                    yourColor: color,
                    yourUserId: currentUser.userId,
                    role,
                })
            )

            // Notify to others
            broadcast(currentRoom, {
                type: "system",
                message: `${currentUser.userId} joined room ${currentRoom}`,
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
                authUserId
            });

            return;
        }


        // TODO: Rate limit msg not too long
        // Auth: now anyone sends msg to any room, if one subs to room1, he mays sends msg to room2
        if (parsedData.type === "chat" && currentRoom && currentUser) {
            if (currentUser.role === "viewer") {
                socket.send(JSON.stringify({
                    type: "error",
                    message: "Read-only invite: cannot modify"
                }));
                return;
            }
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
            broadcast(currentRoom, {
                type: "system",
                message: `${currentUser.userId} left`,
                users: getUserCount(currentRoom),
                userId: currentUser.userId
            });
        }
    });
});