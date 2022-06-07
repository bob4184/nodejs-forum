import express from "express"
import { userId } from "../controllers/user.js"
import { isAuth } from '../lib/side.js';
import { isAdmin } from '../lib/side.js';

const router = express.Router()

router.get('/:id', userId)

export default router