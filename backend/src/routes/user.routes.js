import express from 'express';  
import {login, register, updateProfile} from '../controllers/user.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile);

export default router;