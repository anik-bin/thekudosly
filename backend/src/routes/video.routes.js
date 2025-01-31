import { Router } from "express";
import { submitVideo, appreciateVideo, getTrending } from "../controllers/video.controllers.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

// Protected routes
router.post("/submit", verifyJWT, submitVideo);
router.post("/:videoId/appreciate", verifyJWT, appreciateVideo);
router.get("/trending", getTrending);

export default router;