import express, {Request, Response} from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from "cookie-session";
import {errorHandler, currentUser, NotFoundError} from "@ticketsofnour/common";
import {newOrderRouter} from "./routes/new";
import {showOrderRouter} from "./routes/show";
import {indexOrderRouter} from "./routes";
import {deleteOrderRouter} from "./routes/delete";

const app = express();

app
    .set('trust proxy', true)
    .use(json())
    .use(cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    }))
    .use(currentUser)
    .use(newOrderRouter)
    .use(showOrderRouter)
    .use(indexOrderRouter)
    .use(deleteOrderRouter)
    .all('*', async (req: Request, res: Response) => {
        throw new NotFoundError();
    })
    .use(errorHandler);

export { app };
