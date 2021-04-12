import express, {Response, Request, raw} from "express";
import { body } from "express-validator";
import {
    validateRequest,
    NotFoundError,
    requireAuth,
    UnauthorizedError, BadRequestError
} from "@ticketsofnour/common";
import {Ticket} from "../models/ticket";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.put(
    '/api/tickets/:id',
    requireAuth,
    [
        body('title')
            .optional()
            .notEmpty()
            .withMessage('Title should be valid'),
        body('price')
            .optional()
            .isFloat({ gt: 0})
            .withMessage('Price must be greater than 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const ticketToModify = await Ticket.findById(req.params.id);
        if (!ticketToModify) {
            throw new NotFoundError();
        }
        if (ticketToModify.orderId) {
            throw new BadRequestError('cannot edit a reserved ticket');
        }
        if (ticketToModify.userId !== req.currentUser!.id) {
            throw new UnauthorizedError()
        }
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body,{new: true, useFindAndModify: false})
        await ticket!.save();
        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket!.id,
            title: ticket!.title,
            price: ticket!.price,
            userId: ticket!.userId!,
            version: ticket!.version
        })
        res.send(ticket);
});

export {router as updateTicketRouter}
