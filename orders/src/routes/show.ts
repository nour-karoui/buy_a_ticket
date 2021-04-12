import express, {Response, Request} from "express";
import {BadRequestError, NotFoundError, requireAuth, UnauthorizedError} from "@ticketsofnour/common";
import {Order} from "../models/order";

const router = express.Router();

router.get(
    '/api/orders/:id',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.id).populate('ticket');
        if(!order) {
            throw new NotFoundError();
        }
        if(order.userId !== req.currentUser!.id) {
            throw new UnauthorizedError()
        }
        res.status(200).send(order);
    });

export { router as showOrderRouter }
