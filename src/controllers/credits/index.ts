import { Request, Response } from 'express';
import { prisma } from '../..';

export const generateCredits = async (req: Request, res: Response) => {
    const email = res.locals.email;
    const { amount, totalNumberOfCoupons } = req.body;

    if (!amount || !totalNumberOfCoupons) {
        return res.status(400).send({ message: 'Please provide amount and totalNumberOfCoupouns.' });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    console.log('User:', user);
    if (!user || user.role !== 'vendor') {
        return res.status(404).send({ message: 'Vendor user not found.' });
    }
    
    const creditCodesData = Array.from({ length: totalNumberOfCoupons }).map(() => ({
        code: crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase(),
        amount: amount,
        isRedeemed: false,
    }));

    try {
        await prisma.creditCode.createMany({
            data: creditCodesData
        });
        return res.status(201).send({
            message: `${totalNumberOfCoupons} credit codes generated successfully.`,
        });
    } catch (error) {
        console.error('Failed to generate credits:', error);
        res.status(500).send({ message: 'Failed to generate credits.' });
    }
};

export const getCreditCodes = async (req: Request, res: Response) => {
    const email = res.locals.email;
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || user.role !== 'vendor') {
        return res.status(404).send({ message: 'Vendor user not found.' });
    }

    const creditCodes = await prisma.creditCode.findMany({
        where: { amount: { gt: 0 } },
    });

    return res.send({ creditCodes });
}