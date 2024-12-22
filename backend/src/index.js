import dotenv from 'dotenv';
import { app } from './app.js';
dotenv.config({
    'path': './.env'
});

import connectDB from "./db/db.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("MongoDB connection failed: ", error);
})