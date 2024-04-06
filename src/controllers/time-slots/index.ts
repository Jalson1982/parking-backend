import { Request, Response } from 'express';
import { prisma } from '../..';

interface TimeSlot {
    startTime: number;
    endTime: number;
}
export const addTimeSlot = async (req: Request, res: Response) => {
    const email = res.locals.email;
    const { parkingSpotId, date, timeSlots } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || user.role !== 'vendor') {
        return res.status(403).send({ message: 'Unauthorized' });
    }

    // Check if the ParkingSpot exists and belongs to the vendor
    const parkingSpot = await prisma.parkingSpot.findUnique({
        where: { id: parkingSpotId },
    });

    if (!parkingSpot || parkingSpot.vendorId !== user.id) {
        return res.status(404).send({ message: 'Parking spot not found or does not belong to the vendor.' });
    }

    // Find or create the AvailabilityDate
    let availabilityDate = await prisma.availabilityDate.findFirst({
        where: {
            id: parkingSpotId,
            date: new Date(date),
        },
    });

    if (!availabilityDate) {
        availabilityDate = await prisma.availabilityDate.create({
            data: {
                parkingSpotId,
                date: new Date(date),
            },
        });
    }

    // Add the time slots
    const timeSlotPromises = timeSlots.map((slot: TimeSlot) => 
        prisma.timeSlot.create({
            data: {
                startTime: slot.startTime,
                endTime: slot.endTime,
                availabilityDateId: availabilityDate.id,
            },
        })
    );

    try {
        await Promise.all(timeSlotPromises);
        return res.status(201).send({ message: 'Time slots added successfully.' });
    } catch (error) {
        console.error('Failed to add time slots:', error);
        return res.status(500).send({ message: 'Failed to add time slots.' });
    }
};