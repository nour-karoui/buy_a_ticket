import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from "cookie-session";
import {errorHandler, currentUser} from "@ticketsofnour/common";
import {createTicketRouter} from "./routes/new";
import {showTicketRouter} from "./routes/show";
import {indexTicketRouter} from "./routes";
import {updateTicketRouter} from "./routes/update";

const app = express();

app
    .set('trust proxy', true)
    .use(json())
    .use(cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    }))
    .use(currentUser)
    .use(createTicketRouter)
    .use(showTicketRouter)
    .use(indexTicketRouter)
    .use(updateTicketRouter)
    .use(errorHandler);

export { app };
