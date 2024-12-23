import {Router} from 'express';
import { registerUser } from '../controllers/user.controllers.js';

const router  = Router();

// register a user

router.route('/register').post(registerUser);



export default router;