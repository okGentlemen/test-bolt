import { Request, Response } from 'express';
import { createParser } from 'eventsource-parser';
import { runAsync, getAsync, allAsync } from '../lib/db.js';

interface AuthRequest extends Request {
  userId?: number;
}

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const result = await runAsync(
      'INSERT INTO conversations (user_id, title, created_at, updated_at) VALUES (?, ?, datetime("now"), datetime("now"))',
      [userId, '新对话']
    );
    
    const conversation = await getAsync(
      'SELECT * FROM conversations WHERE id = last_insert_rowid()'
    );
    
    res.json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: '创建对话失败' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const conversations = await allAsync(
      `SELECT c.*, 
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at ASC LIMIT 1) as first_message
       FROM conversations c 
       WHERE user_id = ? 
       ORDER BY updated_at DESC`,
      [userId]
    );
    
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: '获取对话列表失败' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const messages = await allAsync(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: '获取消息记录失败' });
  }
};

export const streamChat = async (req: AuthRequest, res: Response) => {
  const { message, conversationId } = req.body;

  if (!message || !conversationId) {
    return res.status(400).json({ error: 'Message and conversationId are required' });
  }

  try {
    // Save user message
    await runAsync(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversationId, 'user', message]
    );

    // Update conversation timestamp
    await runAsync(
      'UPDATE conversations SET updated_at = datetime("now") WHERE id = ?',
      [conversationId]
    );

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Simulate streaming response
    const words = [
      "基于您的问题，",
      "我将从专业的角度",
      "为您提供详细的分析。",
      "首先，我们需要考虑",
      "这个问题的几个关键方面：\n\n",
      "1. 当前研究现状\n",
      "2. 主要理论框架\n",
      "3. 实践应用案例\n",
      "4. 未来发展趋势\n\n",
      "让我们先从第一点开始分析..."
    ];

    let assistantMessage = '';

    // Stream each word with a delay
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 200));
      assistantMessage += word;
      res.write(`data: ${JSON.stringify({ content: word })}\n\n`);
    }

    // Save assistant message
    await runAsync(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversationId, 'assistant', assistantMessage]
    );

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream chat error:', error);
    res.status(500).json({ message: '发送消息失败' });
  }
};