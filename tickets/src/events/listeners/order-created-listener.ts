import {Listener, NotFoundError, OrderCreatedEvent, Subjects} from "@ticketsofnour/common";
import {Message, Stan} from 'node-nats-streaming';
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    queueGroupName = queueGroupName;
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    constructor(client: Stan) {
        super(client);
    }
    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id)
        if(!ticket) {
            throw new NotFoundError();
        }
        ticket.set({orderId: data.id});
        await ticket.save();
        new TicketUpdatedPublisher(this.client).publish({
            id: ticket!.id,
            version: ticket!.version,
            orderId: data!.id,
            price: ticket!.price,
            title: ticket!.title,
            userId: ticket.userId!
        })
        msg.ack();
    }
}
