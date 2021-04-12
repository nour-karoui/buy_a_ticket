import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Message} from 'node-nats-streaming';
import {OrderCreatedEvent, OrderStatus} from "@ticketsofnour/common";
import mongoose from "mongoose";
import {Ticket} from "../../../models/ticket";
import {TicketDoc} from "../../../models/ticket";

const setup = async (): Promise<{ listener: OrderCreatedListener, msg: Message, data: OrderCreatedEvent["data"], ticket: TicketDoc }> => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);
    // create and save a ticket
    const ticket = Ticket.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'new concert'
    });

    await ticket.save();

    // create a fake event
    const data: OrderCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: 'abd',
        ticket: {
            id: ticket.id,
            price: ticket.price,
            title: ticket.title
        }
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, msg, data, ticket}
}

it('sets the orderId of the message', async () => {
    // call the onMessage function
    const { listener, data, msg, ticket } = await setup();
    // write the appropriate assertions to make sure that the ticket is created
    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeNull();
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const { data, listener, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // write the appropriate assertions to make sure that ack is called
    expect(msg.ack).toHaveBeenCalled();
});
