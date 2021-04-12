import express, {Response, Request} from "express";
import {OrderStatus, NotFoundError, requireAuth, UnauthorizedError} from "@ticketsofnour/common";
import {Order} from "../models/order";
import { OrderCancelledPublisher } from "../event/publishers/order-cancelled-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.delete(
    '/api/orders/:id',
    requireAuth,
    async (req: Request, res: Response) => {
        const {id} = req.params;
        const order = await Order.findById(id).populate('ticket');
        if(!order) {
            throw new NotFoundError();
        }
        if(order.userId !== req.currentUser?.id) {
            throw new UnauthorizedError();
        }
        order.status = OrderStatus.Cancelled;
        await order.save();
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })
        return res.status(200).send(order);
    });

export { router as deleteOrderRouter }
