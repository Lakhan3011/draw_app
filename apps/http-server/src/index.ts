import express, { Response } from 'express';
import { createRoomSchema, signInSchema, signUpSchema } from '@repo/common/schema';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";
import { userMiddleware } from './middleware';
import { AuthRequest } from './types';
import { prisma } from '@repo/db';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
const PORT = 8000;

app.get('/hi', (req, res) => {
    res.json({
        message: "hi from hhtp server"
    })
});

app.post('/signup', async (req, res) => {
    const parsedData = signUpSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(404).json({
            message: "Invalid Input data"
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
    const parsedData = signInSchema.safeParse(req.body);
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
                error: "Invalid credentials"
            })
        }

        const userId = user.id;
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

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
    const parsedData = createRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            error: 'Incorrect Input for room name'
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
            error: "Room already exist with this name"
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
            take: 50,
            orderBy: {
                message: 'desc'
            }
        })

        return res.status(200).json({
            success: true,
            chats: chats
        })
    } catch (error: any) {
        console.log('Error in fetching chats: ', error.message)
    }
})


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
});
