import express from 'express';
import { 
  login, 
  verifyPhoneAndLogin,
  sendVerificationCode,
  resetPassword,
  checkUserExists
} from '../controllers/userController.js';

const router = express.Router();

router.post('/login', login);
router.post('/phone-login', verifyPhoneAndLogin);
router.post('/send-code', sendVerificationCode);
router.post('/reset-password', resetPassword);
router.get('/check-exists', checkUserExists);

export const userRoutes = router;