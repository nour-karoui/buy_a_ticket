import {Listener, NotFoundError, Subjects, TicketUpdatedEvent} from "@ticketsofnour/common";
import { queueGroupName } from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {Stan, Message} from 'node-nats-streaming';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    constructor(client: Stan) {
        super(client);
    }

    async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
        const ticket = await Ticket.findByEvent({id: data.id, version: data.version})
        if(!ticket) {
            throw new NotFoundError();
        }
        const {title, price} = data;
        ticket.set({title, price});
        await ticket.save();
        msg.ack();
    }
}
