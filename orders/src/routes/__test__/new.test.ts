import request from 'supertest';
import mongoose from 'mongoose';
import {app} from "../../app";
import {natsWrapper} from "../../nats-wrapper";

it('returns an error if the ticket doesn\'t exist', async () => {
    const fictionalId = mongoose.Types.ObjectId();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({
            ticketId: fictionalId
        })
        .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
    const ticket = await global.addTicket();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({
            ticketId: ticket.id
        })
        .expect(201);
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({
            ticketId: ticket.id
        })
        .expect(400);
});

it('reserves a ticket successfully', async () => {
    const ticket = await global.addTicket();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({
            ticketId: ticket.id
        })
        .expect(201);
});

it('emits an order created event', async () => {
    const ticket = await global.addTicket();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({
            ticketId: ticket.id
        });
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
