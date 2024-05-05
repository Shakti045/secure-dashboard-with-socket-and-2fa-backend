import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
let io;
let globalsocket;
export const initialiseSocket = (server) => {
    io = new Server(server, { cors: { origin: '*', } });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Token required for socket connection'));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error('Authentication error with token'));
        }
        socket.join(decoded?.id);
        socket.join(decoded?.deviceid);
        next();
    });
    io.on('connection', (socket) => {
        globalsocket = socket;
    });
};
export const getio = () => {
    return io;
};
export const getsocket = () => {
    return globalsocket;
};
//# sourceMappingURL=index.js.map