import express from "express"
import { profile } from "../controllers/profile.js"
import { profileSettings } from "../controllers/profile.js"
import { changeUsername } from "../controllers/profile.js"
import { changePassword } from "../controllers/profile.js"
import { changeMail } from "../controllers/profile.js"
import { newAvatar } from "../controllers/profile.js"
import { logout } from "../controllers/profile.js"
import multer from 'multer';
import { isAuth } from '../lib/side.js';
import { isAdmin } from '../lib/side.js';

var upload = multer({ 
    limits: {
        fileSize: 10000000,
    } 
});

const router = express.Router()

router.get('/', isAuth, profile)
router.get('/settings', isAuth, profileSettings)
router.post('/settings/changeusername', changeUsername)
router.post('/settings/changepassword', changePassword)
router.post('/settings/changemail', changeMail)
router.post('/settings/newavatar', upload.single('image'), newAvatar)
router.get('/logout', logout)

export default router