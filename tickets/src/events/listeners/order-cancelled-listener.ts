import {Listener, NotFoundError, OrderCancelledEvent, OrderCreatedEvent, Subjects} from "@ticketsofnour/common";
import {Message, Stan} from 'node-nats-streaming';
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    queueGroupName = queueGroupName;
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    constructor(client: Stan) {
        super(client);
    }
    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id)
        if(!ticket) {
            throw new NotFoundError();
        }
        ticket.set({orderId: undefined});
        await ticket.save();
        new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            orderId: ticket.orderId,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId!
        })
        msg.ack();
    }
}
