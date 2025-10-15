import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
    console.log('client connected');

    socket.on('message', (message) => {
        console.log('Message from client is: ', message.toString());
        socket.send('Hi from socket server');
    })


})