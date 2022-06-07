import express from "express"
import { main } from "../controllers/misc.js"
import { login } from "../controllers/misc.js"
import { signup } from "../controllers/misc.js"
import { signupProcess } from "../controllers/misc.js"
import { uCheck } from "../controllers/misc.js"
import { isAuth } from '../lib/side.js';
import { isAdmin } from '../lib/side.js';

const router = express.Router()

router.get('/', main)
router.get('/login', login)
router.get('/signup', signup)
router.post('signup', signupProcess)
router.post('/signup/AUCheck', uCheck)

export default router