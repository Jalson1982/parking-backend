import express from 'express';
import { authMiddleware } from '../../middlewares';
import { addPlates, deletePlate } from '../../controllers/plates';

export const platesRouter = express.Router();

platesRouter.post('/plates', authMiddleware, addPlates);
platesRouter.delete('/plates', authMiddleware, deletePlate);