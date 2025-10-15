import { JWT_SECRET } from "@repo/backend-common/config";
import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken';
import { AuthRequest } from "./types";

export const userMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({
            error: "Unauthorized"
        })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        })
    }


}