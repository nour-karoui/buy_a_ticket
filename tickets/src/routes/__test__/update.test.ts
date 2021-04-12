import request from 'supertest';
import {app} from "../../app";
import mongoose from 'mongoose';
import {natsWrapper} from "../../nats-wrapper";

it('returns a 404 if id doesn\'t exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signup())
        .send({
            title: 'new title',
            price: 10
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'new title',
            price: 10
        })
        .expect(401);
});

it('returns a 401 if the user doesn\'t own the ticket', async () => {
    const initialTicket = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: 'title',
            price: 10
        });
    await request(app)
        .put(`/api/tickets/${initialTicket.body.id}`)
        .set('Cookie', global.signup())
        .send({
            title: 'new title',
            price: 10
        })
        .expect(401);
});

it('returns a 400 if the user provides invalid title or price', async () => {
    const cookie = global.signup();
    const initialTicket = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'title',
            price: 10
        });

    await request(app)
        .put(`/api/tickets/${initialTicket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: ''
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${initialTicket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: -10
        })
        .expect(400);
});

it('returns a 201 if the user updates the ticket successfully', async () => {
    const cookie = global.signup();
    const initialTicket = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'title',
            price: 10
        });

    const response = await request(app)
        .put(`/api/tickets/${initialTicket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new Title'
        })
        .expect(200);
});

it('publishes an event', async () => {
    const cookie = global.signup();
    const initialTicket = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'title',
            price: 10
        });

    const response = await request(app)
        .put(`/api/tickets/${initialTicket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new Title'
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
