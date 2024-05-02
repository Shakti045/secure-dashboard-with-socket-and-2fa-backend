import { Server } from 'socket.io';
let io:any;
let globalsocket:any;
export const initialiseSocket = (server:any) => {
    io = new Server(server, { cors: { origin: '*', } });
    io.on('connection', (socket:any) => {
        globalsocket = socket;
        socket.on('disconnect', () => {
        });
        socket.on('join', (room:any) => {
            socket.join(room);
        });
        
    });
};
export const getio = () => {
    return io;
};
export const getsocket = () => {
    return globalsocket;
};
