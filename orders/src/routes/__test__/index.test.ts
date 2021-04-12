import request from 'supertest';
import {app} from "../../app";

it('returns unauthorized when not connected', async () => {
   await request(app)
       .get('/api/orders')
       .expect(401);
});

it('returns', async () => {
    const myTicket = await global.addTicket();
    const notMyTicket = await global.addTicket();
    const me = global.signup();
    const notMe = global.signup();

    const {body: myOrder} = await request(app)
        .post('/api/orders')
        .set('Cookie', me)
        .send({
            ticketId: myTicket.id
        });
    const {body: notMyOrder} = await request(app)
        .post('/api/orders')
        .set('Cookie', notMe)
        .send({
            ticketId: notMyTicket.id
        });

    const {body: myTicketOrderList} = await request(app)
        .get('/api/orders')
        .set('Cookie', me);
    const {body: notMyTicketOrderList} = await request(app)
        .get('/api/orders')
        .set('Cookie', notMe);

    expect(myTicketOrderList).toHaveLength(1);
    expect(myTicketOrderList[0].ticket.id).toEqual(myTicket.id);
    expect(notMyTicketOrderList).toHaveLength(1);
    expect(notMyTicketOrderList[0].ticket.id).toEqual(notMyTicket.id);
})
