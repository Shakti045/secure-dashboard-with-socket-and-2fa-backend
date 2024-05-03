import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io:Server;
let globalsocket:Socket;

export const initialiseSocket = (server:HttpServer) => {
    io = new Server(server, { cors: { origin: '*', } });
    io.on('connection', (socket:Socket) => {
        globalsocket = socket;
        socket.on('disconnect', () => {
        });
        socket.on('join', (room:string) => {
            socket.join(room);
        });
        // socket.on('joindevice', (deviceid:string) => {
        //     socket.join(deviceid);
        // });
        
    });
};
export const getio = () => {
    return io;
};
export const getsocket = () => {
    return globalsocket;
};
