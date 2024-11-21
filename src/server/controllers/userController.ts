import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { getAsync, runAsync } from '../lib/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Store verification codes temporarily (in production, use Redis or similar)
const verificationCodes = new Map<string, { code: string; expires: number }>();

export const checkUserExists = async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;
    const user = await getAsync('SELECT id FROM users WHERE phone = ?', [phone]);
    res.json({ exists: !!user });
  } catch (error) {
    console.error('Check user exists error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: '无效的手机号码' });
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with 5 minute expiration
    verificationCodes.set(phone, {
      code,
      expires: Date.now() + 5 * 60 * 1000
    });

    // In development, return the code in response
    res.json({ 
      message: '验证码已发送',
      code // Remove this in production
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({ message: '发送验证码失败' });
  }
};

export const verifyPhoneAndLogin = async (req: Request, res: Response) => {
  try {
    const { phone, code, password } = req.body;
    
    const storedVerification = verificationCodes.get(phone);
    
    if (!storedVerification) {
      return res.status(400).json({ message: '请先获取验证码' });
    }

    if (storedVerification.code !== code) {
      return res.status(400).json({ message: '验证码错误' });
    }

    if (Date.now() > storedVerification.expires) {
      verificationCodes.delete(phone);
      return res.status(400).json({ message: '验证码已过期，请重新获取' });
    }

    // Find or create user
    let user = await getAsync('SELECT * FROM users WHERE phone = ?', [phone]);
    
    if (!user) {
      if (!password) {
        return res.status(400).json({ message: '新用户需要设置密码' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await runAsync(
        'INSERT INTO users (phone, username, password, created_at, updated_at) VALUES (?, ?, ?, datetime("now"), datetime("now"))',
        [phone, phone, hashedPassword] // Use phone as initial username
      );
      user = await getAsync('SELECT * FROM users WHERE phone = ?', [phone]);
    }

    if (!user) {
      throw new Error('Failed to create user');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    
    // Clean up used code
    verificationCodes.delete(phone);
    
    res.json({ 
      token,
      phone: user.phone,
      message: '登录成功'
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ message: '登录失败，请重试' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { phone, code, newPassword } = req.body;
    
    const storedVerification = verificationCodes.get(phone);
    
    if (!storedVerification) {
      return res.status(400).json({ message: '请先获取验证码' });
    }

    if (storedVerification.code !== code) {
      return res.status(400).json({ message: '验证码错误' });
    }

    if (Date.now() > storedVerification.expires) {
      verificationCodes.delete(phone);
      return res.status(400).json({ message: '验证码已过期，请重新获取' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await runAsync(
      'UPDATE users SET password = ?, updated_at = datetime("now") WHERE phone = ?',
      [hashedPassword, phone]
    );

    verificationCodes.delete(phone);
    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: '密码重置失败，请重试' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Try to find user by username or phone
    const user = await getAsync(
      'SELECT * FROM users WHERE username = ? OR phone = ?',
      [username, username]
    );

    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: '密码错误' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({ 
      token, 
      username: user.username || user.phone,
      message: '登录成功'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登录失败，请重试' });
  }
};