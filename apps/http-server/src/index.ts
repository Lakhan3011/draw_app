import express, { Response } from 'express';
import { createRoomSchema, signInSchema, signUpSchema } from '@repo/common/schema';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";
import { userMiddleware } from './middleware';
import { AuthRequest } from './types';
import { prisma } from '@repo/db';
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express();
app.use(express.json());
const PORT = 8000;
app.use(cors());

app.get('/hi', (req, res) => {
    res.json({
        message: "hi from hhtp server"
    })
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const parsedData = signUpSchema.safeParse({ name, email, password });
    if (!parsedData.success) {
        return res.status(404).json({
            message: "Invalid Input name data"
        })
    }
    try {
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

        await prisma.user.create({
            data: {
                name: parsedData.data.name,
                email: parsedData.data.email,
                password: hashedPassword,
            }
        })

        return res.status(200).json({
            success: true,
            message: "User signed up!!"
        })
    } catch (error) {
        return res.status(409).json({
            success: false,
            message: 'Duplicate user entry'
        });
    }
});


app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const parsedData = signInSchema.safeParse({ email, password });
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid Input data"
        })
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: parsedData.data.email
            }
        });

        if (!user || !(await bcrypt.compare(parsedData.data.password, user.password))) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        const userId = user.id;
        const token = jwt.sign({ userId }, JWT_SECRET);

        return res.status(200).json({
            success: true,
            token: token,
            message: "User signin successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server error"
        });
    }
});

app.post('/room', userMiddleware, async (req: AuthRequest, res: Response) => {
    const { name } = req.body;
    const parsedData = createRoomSchema.safeParse({ name });
    if (!parsedData.success) {
        return res.status(400).json({
            message: 'Incorrect Input for room name'
        })
    }
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized access"
        })
    }

    try {
        const room = await prisma.room.create({
            data: {
                adminId: userId,
                slug: parsedData.data.name
            }
        })
        const roomId = room.id;

        return res.status(200).json({
            success: true,
            roomId: roomId,
            message: "Room created successfully"
        })
    } catch (error) {
        return res.status(411).json({
            message: "Room already exist with this name"
        })
    }
})

app.delete('/delete-room/:roomId', userMiddleware, async (req: AuthRequest, res: Response) => {
    const roomId = Number(req.params.roomId);
    const userId = req.userId;

    if (isNaN(roomId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room ID"
        });
    }

    try {
        const room = await prisma.room.findUnique({
            where: {
                id: roomId
            },
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        if (room.adminId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this room",
            });
        }

        await prisma.room.delete({
            where: {
                id: roomId
            }
        });

        return res.status(200).json({
            success: true,
            message: `${room.slug} is deleted successfully`
        })
    } catch (error) {
        console.error("Delete room error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

app.get('/existing-rooms', userMiddleware, async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized user"
        })
    }

    try {
        const rooms = await prisma.room.findMany({
            where: {
                adminId: userId
            }
        })

        if (rooms) {
            return res.status(200).json({
                success: true,
                rooms: rooms
            })
        }

        return res.status(404).json({
            message: "Error in fetching existing rooms"
        })

    } catch (error: any) {
        return res.status(500).json({
            message: `Internal Server Error || ${error.message}`
        })
    }
})

app.get('/chats/:roomId', async (req, res) => {
    const roomId = Number(req.params.roomId);

    try {
        const chats = await prisma.chat.findMany({
            where: {
                roomId
            },
            take: 1000,
            orderBy: {
                message: 'desc'
            }
        })
        if (chats) {
            return res.status(200).json({
                success: true,
                chats: chats
            })
        }

        return res.status(404).json({
            message: "Error in fetching chats"
        })

    } catch (error: any) {
        // console.log('Error in fetching chats: ', error.message);
        return res.status(500).json({
            success: false,
            error: `Internal server error || ${error.message}`
        })
    }
})

app.get('/room/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const room = await prisma.room.findUnique({
            where: {
                slug
            }
        })

        return res.status(200).json({
            success: true,
            roomId: room?.id
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })
    }
})


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
});
