import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { startCron } from './utils/cronJob.js';

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }
))

app.use(express.json({ limit: '30mb'}),)
app.use(express.urlencoded({extended: true, limit: '30mb'}));
app.use(express.static('public'));
app.use(cookieParser());
startCron();

// import routes
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';

// use routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);

export { app };