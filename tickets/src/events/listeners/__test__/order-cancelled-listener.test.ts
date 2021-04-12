import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Message} from 'node-nats-streaming';
import {OrderCancelledEvent, OrderStatus} from "@ticketsofnour/common";
import mongoose from "mongoose";
import {Ticket} from "../../../models/ticket";
import {TicketDoc} from "../../../models/ticket";

const setup = async (): Promise<{ listener: OrderCancelledListener, msg: Message, data: OrderCancelledEvent["data"], ticket: TicketDoc, orderId: string }> => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = new mongoose.Types.ObjectId().toHexString();
    // create and save a ticket
    const ticket = Ticket.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'new concert',
    });

    ticket.set({orderId});

    await ticket.save();

    // create a fake event
    const data: OrderCancelledEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            id: ticket.id
        }
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, msg, data, ticket, orderId}
}

it('updates, publishes and acks', async () => {
    const { msg, data, ticket, orderId, listener} = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
