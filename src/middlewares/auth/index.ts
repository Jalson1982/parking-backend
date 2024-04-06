import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    email: string;
}
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({
            message: 'Unauthorized',
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as JwtPayload;
        res.locals.email = decoded.email;
        if (!decoded) {
            return res.status(401).send({
                message: 'Unauthorized',
            });
        }
        next();
    } catch (error) {
        return res.status(401).send({
            message: 'Unauthorized',
        });
    }
};
