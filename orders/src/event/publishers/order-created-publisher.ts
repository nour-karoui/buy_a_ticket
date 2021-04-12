import {OrderCreatedEvent, Publisher, Subjects} from "@ticketsofnour/common";
import {Stan} from 'node-nats-streaming';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    constructor(client: Stan) {
        super(client);
    }
}
