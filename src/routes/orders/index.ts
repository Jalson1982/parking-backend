import express from 'express';
import { authMiddleware } from '../../middlewares';
import {createOrder, getAllOrders, getVendorOrders } from '../../controllers';

export const ordersRouter = express.Router();

ordersRouter.post('/orders', authMiddleware, createOrder);
ordersRouter.get('/orders', authMiddleware, getAllOrders);
ordersRouter.get('/vendor-orders', authMiddleware, getVendorOrders);