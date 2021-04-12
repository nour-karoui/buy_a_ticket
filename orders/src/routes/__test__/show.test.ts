import request from 'supertest';
import {app} from "../../app";

it('fetches the order', async () => {
    const me = global.signup();
    const ticket = await global.addTicket();
    const {body: myOrder} = await request(app)
        .post('/api/orders')
        .set('Cookie', me)
        .send({
            ticketId: ticket.id
        });

    const {body: getMyOrder} = await request(app)
        .get(`/api/orders/${myOrder.id}`)
        .set('Cookie', me)
        .send()
        .expect(200);

    expect(getMyOrder.id).toEqual(myOrder.id);
});

it('doesn\'t fetch somebody else\'s order', async () => {
    const me = global.signup();
    const ticket = await global.addTicket();
    const {body: myOrder} = await request(app)
        .post('/api/orders')
        .set('Cookie', me)
        .send({
            ticketId: ticket.id
        });

    const {body: getMyOrder} = await request(app)
        .get(`/api/orders/${myOrder.id}`)
        .set('Cookie', global.signup())
        .send()
        .expect(401);
});
