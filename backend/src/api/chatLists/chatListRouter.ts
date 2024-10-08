import { fetchUserFromToken, isAuthenticated } from '@/common/middleware/passport';
import express, { Router } from 'express';
import { addChatMails, getChatMails, getChatRoom, getFile, getListChatRoom } from './chatListController';
export const chatListRouter: Router = express.Router();

chatListRouter.use(fetchUserFromToken);
chatListRouter.post('/chat/getChatRoom', isAuthenticated, getChatRoom);
chatListRouter.post('/chat/getListChatRoom', isAuthenticated, getListChatRoom);
chatListRouter.post('/chat/getMailsRoom', isAuthenticated, getChatMails);
chatListRouter.post('/chat/sendMail', isAuthenticated, addChatMails);
chatListRouter.get('/files/:id/:id2/:name', getFile);
chatListRouter.get('/admin/files/:id/:id2/:name', getFile);
