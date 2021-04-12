import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import {Ticket, TicketDoc} from "../models/ticket";

let mongo: any;

declare global {
    namespace NodeJS {
        interface Global {
            signup(): string[];
            addTicket(): Promise<TicketDoc>;
        }
    }
}

jest.mock('../nats-wrapper');

beforeAll(async () => {
    process.env.JWT_KEY = 'asdf';
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
   const collections = await mongoose.connection.db.collections();
   for (let collection of collections) {
       await collection.deleteMany({});
   }
});

afterAll(async () => {
   await mongo.stop();
   await mongoose.connection.close();
});

global.signup = () => {
    // Build a JWT payload. {id, email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }
    // Create JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session Object
    const session = {jwt: token};

    // Turn that session into json
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base 64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return a string that's a cookie with the encoded data
    return [`express:sess=${base64}`];
};

global.addTicket = async () => {
    const id = mongoose.Types.ObjectId().toHexString()
    const mockTicket = Ticket.build({id, price: 123, title: 'concert'});
    return await mockTicket.save();
}
