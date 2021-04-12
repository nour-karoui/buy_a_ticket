import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Message} from 'node-nats-streaming';
import {TicketCreatedEvent} from "@ticketsofnour/common";
import mongoose from "mongoose";
import {Ticket} from "../../../models/ticket";

const setup = async (): Promise<{ listener: TicketCreatedListener, msg: Message, data: TicketCreatedEvent["data"] }> => {
    // create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    // create a fake event
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString()
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, msg, data}
}

it('creates and saves a ticket', async () => {
    // call the onMessage function
    const { listener, data, msg } = await setup();
    // write the appropriate assertions to make sure that the ticket is created
    await listener.onMessage(data, msg)

    const ticket = await Ticket.findById(data.id);

    expect(ticket).not.toBeNull();5
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
    const { data, listener, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // write the appropriate assertions to make sure that ack is called
    expect(msg.ack).toHaveBeenCalled();
});
