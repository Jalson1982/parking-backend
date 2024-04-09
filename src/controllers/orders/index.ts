import { Request, Response } from 'express';
import { prisma } from '../..';

export const createOrder = async (req: Request, res: Response) => {
    const { parkingSpotId, platesId, timeSlotId } = req.body;
    const email = res.locals.email;
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(404).send({ message: 'User not found.' });
    }
    if(user.totalCredits === 0) {
        return res.status(403).send({ message: 'Insufficient credits.' });
     }

    const result = await prisma.$transaction(async (prisma) => {
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                parkingSpotId,
                platesId,
                timeSlotId,
                amountPaid: 1,
            },
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { totalCredits: { decrement: 1 } }
        });
    
        const timeSlotUpdate = await prisma.timeSlot.update({
            where: { id: timeSlotId },
            data: { isAvailable: false },
        });

        return { order, timeSlotUpdate };
    });

    if (result) {
        res.status(201).json({
            message: "Order created and time slot updated successfully.",
            data: result,
        });
    } else {
        res.status(500).send({
            message: "An error occurred while creating the order and updating the time slot.",
        });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {

    const orders = await prisma.order.findMany();

    res.send({
        orders,
    });
};

export const getVendorOrders = async (req: Request, res: Response) => {
    const email = res.locals.email;
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || user.role !== 'vendor') {
        return res.status(404).send({ message: 'User not found.' });
    }

    const soldTimeSlots = await prisma.parkingSpot.findMany({
        where: {
            vendor: {
                id: user.id,
            },
        },
        include: {
            orders: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    },
                    plates: true,
                    timeSlot: {
                        select: {
                            id: true,
                            startTime: true,
                            endTime: true,
                            isAvailable: true,
                        },
                    },
                },
            },
        },
    });
    res.send({
        soldTimeSlots,
    });
}