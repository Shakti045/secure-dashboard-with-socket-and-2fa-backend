import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({path:'.env'});

let io:Server;
let globalsocket:Socket;

export const initialiseSocket = (server:HttpServer) => {
    io = new Server(server, { cors: { origin: '*', } });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if(!token) {
            return next(new Error('Token required for socket connection'));
        }
        const decoded:any = jwt.verify(token, process.env.JWT_SECRET!);
        if(!decoded) {
            return next(new Error('Authentication error with token'));
        }
        socket.join(decoded?.id);
        socket.join(decoded?.deviceid);
        next();
    });
    io.on('connection', (socket:Socket) => {
        globalsocket = socket;
    });
};
export const getio = () => {
    return io;
};
export const getsocket = () => {
    return globalsocket;
};
