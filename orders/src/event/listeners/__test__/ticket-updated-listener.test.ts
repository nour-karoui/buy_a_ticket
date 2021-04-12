import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Message} from 'node-nats-streaming';
import {TicketUpdatedEvent} from "@ticketsofnour/common";
import mongoose from "mongoose";
import {Ticket, TicketDoc} from "../../../models/ticket";

const setup = async (): Promise<{ listener: TicketUpdatedListener, msg: Message, data: TicketUpdatedEvent["data"], ticket: TicketDoc }> => {
    // create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    //create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    })
    await ticket.save();

    // create a fake event
    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'new concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, msg, data, ticket}
}

it('finds, updates and saves a ticket', async () => {
    // call the onMessage function
    const { listener, data, msg, ticket } = await setup();
    // write the appropriate assertions to make sure that the ticket is created
    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).not.toBeNull();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { data, listener, msg } = await setup();
    // call the onMessage function
    await listener.onMessage(data, msg);
    // write the appropriate assertions to make sure that ack is called
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version', async () => {
    const { msg, data, listener, ticket } = await setup();
    data.version = data.version + 1;
    try {
        await listener.onMessage(data, msg);
    } catch (err) {}
    expect(msg.ack).not.toHaveBeenCalled();
});
