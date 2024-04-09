import express from 'express';
import { authMiddleware } from '../../middlewares';
import { generateCredits, getCreditCodes } from '../../controllers/credits';

export const creditsRouter = express.Router();

creditsRouter.post('/credits', authMiddleware, generateCredits);
creditsRouter.get('/credits', authMiddleware, getCreditCodes);
