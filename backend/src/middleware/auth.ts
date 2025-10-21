import { Request, Response, NextFunction } from 'express'
import { db } from '../db/db'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    console.log("Auth middleware called");
    const token = req.headers.authorization?.split(' ')[1]
    console.log("Auth middleware, token: ", token);

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    const tokenResponse = await db.tokens.findUnique({
        where: {
            token: token,
        },
        select: {
            userId: true,
        }
    })

    if (!tokenResponse) {
        res.status(401).json({ message: 'Invalid token' })
        return
    }

    req.user = {
        id: tokenResponse.userId,
        token: token,
    }

    next();
}