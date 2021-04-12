import express, { Request, Response} from "express";
import {requireAuth, validateRequest} from "@ticketsofnour/common";
import {body} from "express-validator";
import {Ticket} from "../models/ticket";
import {TicketCreatedPublisher} from "../events/publishers/ticket-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.post(
    '/api/tickets',
    requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('Title is required'),
       body('price')
           .isFloat({gt: 0})
           .withMessage('price is required & must be greater than 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { title, price } = req.body;
        const ticket = Ticket.build({
            title,
            price,
            userId: req.currentUser!.id
        });
        await ticket.save();
        const publisher = new TicketCreatedPublisher(natsWrapper.client);
        await publisher.publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });
        res.status(201).send(ticket);
    });

export { router as createTicketRouter}
