import express from 'express';  
import {login, register, updateProfile, uploadResume} from '../controllers/user.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import multer from 'multer';

// Configure multer to store file uploads temporarily in memory as buffers
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.post('/profile/resume', protect, upload.single('resume'), uploadResume);

export default router;