import express from 'express';
import { authMiddleware } from '../../middlewares';
import { addParkingSpot, getAllParkingSpots } from '../../controllers';

export const parkingLotsRouter = express.Router();

parkingLotsRouter.post('/parking-lots', authMiddleware, addParkingSpot);
parkingLotsRouter.get('/parking-lots', authMiddleware, getAllParkingSpots);