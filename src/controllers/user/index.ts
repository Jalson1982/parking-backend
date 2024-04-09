import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../..';
import jwt from 'jsonwebtoken';

const generateToken = (userEmail: string) => {
    return jwt.sign({ email: userEmail }, process.env.TOKEN_SECRET ?? '', { expiresIn: '24h' });
  };

  
export const getUsers = async (_: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.send({
        users,
    });
}

export const addNewUser = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const token = generateToken(email);
    const userRole = role || 'USER';
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: userRole,
        },
    }).catch((error: Error) => {
        return res.status(400).send({
            message: error.message,
        });
    });

    res.send({
        user: {
            ...user,
            token,
        },
    });
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if(!email || !password) {
        res.status(400).send({
            message: 'Email and password are required',
        });
        return;
    }
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        res.status(400).send({
            message: 'Invalid email or password',
        });
        return;
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        res.status(400).send({
            message: 'Invalid email or password',
        });
        return;
    }
    const token = generateToken(email);
    const { password: _, ...userWithoutPassword } = user;
    res.send({
        user: {
            ...userWithoutPassword,
            token,
        },
    });
}

export const getUser = async (_: Request, res: Response) => {
    const email = res.locals.email;
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        res.status(404).send({
            message: 'User not found',
        });
        return;
    }

    const includeOptions = user.role === 'vendor' 
        ? { parkingSpot: true, orders: true } 
        : { plates: true, orders: true };

    const userDetails = await prisma.user.findUnique({
        where: { email },
        include: includeOptions,
    });

    if (!userDetails) {
        res.status(404).send({
            message: 'User details not found',
        });
        return;
    }

    const { password: hashedPassword, ...userWithoutPassword } = userDetails;
    res.send({
        user: userWithoutPassword,
    });
};


export const updateUser = async (req: Request, res: Response) => {
    const email = res.locals.email;
    const { firstName, lastName } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        res.status(404).send({
            message: 'User not found',
        });
        return;
    }
    const updatedUser = await prisma.user.update({
        where: {
            email,
        },
        data: {
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
        },
    });
    res.send({
        user: updatedUser,
    });
}

export const addCredit = async (req: Request, res: Response) => {
    const email = res.locals.email;
    const { creditCode } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        res.status(404).send({
            message: 'User not found',
        });
        return;
    }
    const code = await prisma.creditCode.findUnique({
        where: {
            code: creditCode,
        },
    });
    if (!code || code.isRedeemed) {
        res.status(404).send({
            message: 'Invalid credit code',
        });
        return;
    }
    const updatedUser = await prisma.user.update({
        where: {
            email,
        },
        data: {
            totalCredits: user.totalCredits + (code?.amount ?? 0),
        },
    });
    await prisma.creditCode.update({
        where: {
            code: creditCode,
        },
        data: {
            isRedeemed: true,
        },
    });
    res.send({
        user: updatedUser,
    });
}