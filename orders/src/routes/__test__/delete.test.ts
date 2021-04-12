import request from 'supertest';
import {app} from "../../app";
import {OrderStatus} from "@ticketsofnour/common";

it('marks an order as cancelled', async () => {
   const ticket = await global.addTicket();
   const me = global.signup();
   const {body: order} = await request(app)
       .post('/api/orders')
       .set('Cookie', me)
       .send({
           ticketId: ticket.id
       })
       .expect(201);

   const {body: cancelledOrder} = await request(app)
       .delete(`/api/orders/${order.id}`)
       .set('Cookie', me)
       .expect(200);

   expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);
});
