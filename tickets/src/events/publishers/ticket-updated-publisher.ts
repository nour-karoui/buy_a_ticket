import {Publisher, Subjects, TicketUpdatedEvent} from "@ticketsofnour/common";
import {Stan} from 'node-nats-streaming';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    constructor(client: Stan) {
        super(client);
    }
}
