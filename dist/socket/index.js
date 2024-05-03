import { Server } from 'socket.io';
let io;
let globalsocket;
export const initialiseSocket = (server) => {
    io = new Server(server, { cors: { origin: '*', } });
    io.on('connection', (socket) => {
        globalsocket = socket;
        socket.on('disconnect', () => {
        });
        socket.on('join', (room) => {
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
//# sourceMappingURL=index.js.map