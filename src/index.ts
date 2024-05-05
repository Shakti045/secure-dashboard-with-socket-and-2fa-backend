import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import router from './routes/route.js';
import { connectDb } from './config/dbconfig.js';
import { initialiseSocket } from './socket/index.js';
import userAgent from 'express-useragent';


dotenv.config({path:'.env'});

const app = express();
const server = http.createServer(app);
initialiseSocket(server);

app.use(cookieparser());
app.use(userAgent.express());
app.use(cors({origin: '*',credentials: true}));
app.use(express.json());
app.use("/api/v1",router);

app.get('/', (req, res) => {
    return res.json({message: 'Hello World!'});
});


const PORT = process.env.PORT || 4000;
server.listen( PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

connectDb();