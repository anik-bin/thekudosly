import {Router} from 'express';
import { registerUser, loginUser, logoutUser, refreshAccessToken } from '../controllers/user.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router  = Router();

/*
UNSECURED ROUTES
*/

router.route('/register').post(registerUser); // register a user
router.route('/login').post(loginUser); // login a user

/*
SECURED ROUTES
*/

router.route('/logout').post(verifyJWT, logoutUser); // logout a user

router.route('/refresh-token').post(refreshAccessToken); // refresh access token

export default router;