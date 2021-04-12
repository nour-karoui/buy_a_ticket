import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from "cookie-session";
import {currentUserRouter} from "./routes/current-user";
import {signInRouter} from "./routes/signin";
import {signUpRouter} from "./routes/signup";
import {signOutRouter} from "./routes/signout";
import {errorHandler} from "@ticketsofnour/common";

const app = express();

app
    .set('trust proxy', true)
    .use(json())
    .use(cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    }))
    .use(currentUserRouter)
    .use(signInRouter)
    .use(signOutRouter)
    .use(signUpRouter)
    .use(errorHandler);

export { app };
