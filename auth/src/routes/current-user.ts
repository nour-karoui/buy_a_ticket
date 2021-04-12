import express from 'express';
import {currentUser} from "@ticketsofnour/common";

const router = express.Router();

router.get(
    '/api/users/current-user',
    currentUser,
    async (req, res) => {
        res.send({currentUser: req.currentUser || null});
    });

export { router as currentUserRouter }
