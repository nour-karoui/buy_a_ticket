import express, {Response, Request} from "express";
import {requireAuth} from "@ticketsofnour/common";
import {Order} from "../models/order";

const router = express.Router();

router.get(
    '/api/orders',
    requireAuth,
    async (req: Request, res: Response) => {
        const orders = await Order.find({
            userId: req.currentUser?.id
        }).populate('ticket');
        res.status(200).send(orders);
    });

export { router as indexOrderRouter }
