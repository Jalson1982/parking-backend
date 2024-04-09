import express from 'express';
import { authMiddleware } from '../../middlewares';
import { getAllParkingSpots } from '../../controllers';
import { addTimeSlot, getTimeSlots } from '../../controllers/time-slots';

export const timeSlotsRouter = express.Router();

timeSlotsRouter.post('/time-slots', authMiddleware, addTimeSlot);
timeSlotsRouter.get('/time-slots', authMiddleware, getTimeSlots);