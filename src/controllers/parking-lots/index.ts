import { Request, Response } from 'express';
import { prisma } from '../..';

export const addParkingSpot = async (req: Request, res: Response) => {
    const email = res.locals.email;
    const { parkingNumber, address } = req.body;

    if (!parkingNumber || !address) {
        return res.status(400).send({ message: 'Please provide a parking number and address.' });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || user.role !== 'vendor') {
        return res.status(404).send({ message: 'Vendor user not found.' });
    }
    
    try {
        const parkingSpot = await prisma.parkingSpot.create({
            data: {
                parkingNumber,
                address,
                vendorId: user.id,
            },
        });

        return res.status(201).send({
            message: 'Parking spot added successfully.',
            parkingSpot,
        });
    } catch (error) {
        console.error('Failed to add parking spot:', error);
        return res.status(500).send({ message: 'Failed to add parking spot.' });
    }
};

export const getAllParkingSpots = async (_: Request, res: Response) => {
    const parkingSpots = await prisma.parkingSpot.findMany({
        include: {
            vendor: false,
        },
    });

    res.send({
        parkingSpots,
    });
}