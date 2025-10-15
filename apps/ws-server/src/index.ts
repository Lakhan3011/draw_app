import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@repo/backend-common/config'
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket, req) => {
    console.log('client connected');

    const url = req.url;
    if (!url) {
        return;
    };

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded || !decoded.userId) {
        wss.close();
        return;
    }

    socket.on('message', (message) => {
        console.log('Message from client is: ', message.toString());
        socket.send('Hi from socket server');
    })


})