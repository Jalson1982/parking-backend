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

    const parkingSpot = await prisma.parkingSpot.findUnique({
        where: { id: parkingSpotId },
    });

    if (!parkingSpot || parkingSpot.vendorId !== user.id) {
        return res.status(404).send({ message: 'Parking spot not found or does not belong to the vendor.' });
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    let availabilityDate = await prisma.availabilityDate.findFirst({
        where: {
            parkingSpotId,
            date: parsedDate,
        },
    });

    if (!availabilityDate) {
        availabilityDate = await prisma.availabilityDate.create({
            data: {
                parkingSpotId,
                date: parsedDate,
            },
        });
    }

    const timeSlotPromises = timeSlots.map(async (slot: TimeSlot) => {
        const existingSlot = await prisma.timeSlot.findFirst({
            where: {
                availabilityDateId: availabilityDate.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
            },
        });

        if (!existingSlot) {
            return prisma.timeSlot.create({
                data: {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    availabilityDateId: availabilityDate.id,
                },
            });
        }
        return null;
    });

    try {
        const addedSlots = (await Promise.all(timeSlotPromises)).filter(Boolean);
        return res.status(201).send({ message: `Time slots added successfully. Total added: ${addedSlots.length}`, addedSlots });
    } catch (error) {
        console.error('Failed to add time slots:', error);
        return res.status(500).send({ message: 'Failed to add time slots.' });
    }
};


export const getTimeSlots = async (req: Request, res: Response) => {
    // Explicitly extract and convert query parameters
    const parkingSpotId = req.query.parkingSpotId;
    const dateString = req.query.date;

    // Check if parameters are provided and are of correct type (string)
    if (typeof parkingSpotId !== 'string' || typeof dateString !== 'string') {
        return res.status(400).send({ message: 'Please provide both parkingSpotId and date as strings.' });
    }

    // Convert parkingSpotId to number and dateString to Date
    const parkingSpotIdNumber = Number(parkingSpotId);
    const date = new Date(dateString);

    if (isNaN(parkingSpotIdNumber)) {
        return res.status(400).send({ message: 'parkingSpotId must be a number.' });
    }

    if (isNaN(date.getTime())) {
        return res.status(400).send({ message: 'Invalid date provided.' });
    }

    // Convert date to the start of the day and end of the day to cover the whole date range
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0); // Set to start of the day

    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999); // Set to end of the day

    try {
        const timeSlots = await prisma.timeSlot.findMany({
            where: {
                availabilityDate: {
                    parkingSpotId: parkingSpotIdNumber,
                    date: {
                        gte: dateStart,
                        lte: dateEnd,
                    },
                },
            },
            orderBy: {
                startTime: 'asc', // Assuming you want to order by start time
            },
        });

        res.send({ timeSlots });
    } catch (error) {
        console.error('Failed to retrieve time slots:', error);
        return res.status(500).send({ message: 'Failed to retrieve time slots.' });
    }
};
