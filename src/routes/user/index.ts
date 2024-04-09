import express from 'express';
import { addCredit, addNewUser, getUser, getUsers, login, updateUser } from '../../controllers';
import { authMiddleware } from '../../middlewares';

export const userRouter = express.Router();

userRouter.get('/users', authMiddleware, getUsers);
userRouter.post('/users', addNewUser);
userRouter.post('/login', login);
userRouter.get('/user', authMiddleware, getUser);
userRouter.patch('/user', authMiddleware, updateUser);
userRouter.post('/user-credits', authMiddleware, addCredit);