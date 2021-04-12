import express, {Response, Request} from "express";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import {OrderCreatedPublisher} from "../event/publishers/order-created-publisher";
import {NotFoundError, requireAuth, validateRequest, OrderStatus, BadRequestError} from "@ticketsofnour/common";
import {body} from "express-validator";
import mongoose from "mongoose";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();
const EXPIRATION_WINDOW_MINUTES = 15;

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId')
            .custom(value => {return mongoose.Types.ObjectId.isValid(value)})
            .withMessage('TicketId must be provided')
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        // Check if ticketId is valid
        const { ticketId } = req.body;
        const ticket = await Ticket.findById(ticketId);
        if(!ticket) {
            throw new NotFoundError();
        }

        // Make sure the ticket is available
        const isReserved = await ticket.isReserved();
        if(isReserved) {
            throw new BadRequestError('Ticket Already Reserved');
        }

        // Set an expiration date of 15minutes
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 15);

        // Build the order and save it to database
        const order = Order.build({
            userId: req.currentUser!.id,
            expiresAt: expiration,
            ticket
        });
        await order.save();

        // Publish an event for the order creation
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            version: order.version,
            ticket: {
                id: ticket.id,
                price: ticket.price,
                title: ticket.title
            }
        });
        res.status(201).send(order);
    });

export { router as newOrderRouter }
