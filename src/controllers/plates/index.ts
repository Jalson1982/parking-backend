import { Request, Response } from 'express';
import { prisma } from '../..';

export const addPlates = async (req: Request, res: Response) => {
    const email = res.locals.email;
    const { plates } = req.body;

    if (!plates || !Array.isArray(plates) || plates.length === 0) {
        return res.status(400).send({ message: 'Please provide an array of plates.' });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(404).send({ message: 'User not found.' });
    }

    for (const plate of plates) {
        const existingPlate = await prisma.plates.findUnique({
            where: { plate },
        });
        if (existingPlate && existingPlate.userId !== user.id) {
            return res.status(400).send({ message: `Plate "${plate}" is already registered to another user.` });
        }
    }

    const plateOperations = plates.map((plate) => {
        return prisma.plates.upsert({
            where: { plate },
            update: {},
            create: {
                plate,
                userId: user.id,
            },
        });
    });

    await Promise.all(plateOperations);

    return res.send({ message: 'Plates added/updated successfully.' });
};


export const deletePlate = async (req: Request, res: Response) => {
    const email = res.locals.email;
    const { plate } = req.body;

    if (!plate) {
        return res.status(400).send({ message: 'Please provide a plate.' });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(404).send({ message: 'User not found.' });
    }

    const existingPlate = await prisma.plates.findUnique({
        where: { plate },
    });

    if (!existingPlate || existingPlate.userId !== user.id) {
        return res.status(404).send({ message: 'Plate not found.' });
    }

    await prisma.plates.delete({
        where: { plate },
    });

    return res.send({ message: 'Plate removed successfully.' });
}