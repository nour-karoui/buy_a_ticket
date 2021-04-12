import {OrderCancelledEvent, Publisher, Subjects} from "@ticketsofnour/common";
import {Stan} from 'node-nats-streaming';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    constructor(client: Stan) {
        super(client);
    }
}
