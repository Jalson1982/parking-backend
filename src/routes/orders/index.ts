import express from 'express';
import { authMiddleware } from '../../middlewares';
import {createOrder, getAllOrders } from '../../controllers';

export const ordersRouter = express.Router();

ordersRouter.post('/orders', authMiddleware, createOrder);
ordersRouter.get('/orders', authMiddleware, getAllOrders);