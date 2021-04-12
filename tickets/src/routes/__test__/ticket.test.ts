import { Ticket } from "../../models/ticket";

it('implements optimistic concurrency control', async () => {
    const ticket = Ticket.build({
        title: 'concert one',
        price: 25,
        userId: 'aaaaaaaa'
    });

    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance!.title = 'first edit';
    firstInstance!.title = 'second edit';

    await firstInstance!.save();
    expect(await secondInstance!.save).toThrowError();
});

it('increments the version number on multiple saves', async () => {
   const ticket = Ticket.build({
      title: 'one',
      price: 25,
      userId: 'abc'
   });

   await ticket.save();
   expect(ticket.version).toEqual(0);
   await ticket.save();
   expect(ticket.version).toEqual(1);
   await ticket.save();
   expect(ticket.version).toEqual(2);
});
