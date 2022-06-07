import date from 'date-fns'
import { validPassword } from '../lib/passprocess.js';
import { Post } from '../db/db.js';
import { User } from '../db/db.js';
import { Image } from '../db/db.js';
import { Vote } from '../db/db.js';
import sharp from 'sharp'

async function getMetadata(pic) {
    const metadata = await sharp(pic).metadata();
    console.log(metadata);
}

export const profile = async (req, res) => {
    User.findById(req.session.passport.user)
    .then((user) => {
        Post.find({authorId: user._id})
        .then((userPosts) => {
            res.render('profile', {user, Auth: req.isAuthenticated(), date, userPosts})
        })
    })
}

export const profileSettings = async (req, res) => {
    User.findById(req.session.passport.user)
    .then((user) => {
        res.render('profileset', {user, Auth: req.isAuthenticated()})
    })
}

export const changeUsername = async (req, res) => {
    User.findOne({username: req.body.newusername})
    .then((result) => {
        if (result === null) {
            User.findByIdAndUpdate(req.session.passport.user, {username: req.body.newusername})
            .then((result) => {
                res.redirect('/profile')
            })
            
        } else {
            res.json({ usernameAvailable: 0})
        }
    })
}

export const changePassword = async (req, res) => {
    const saltHash = genPassword(req.body.newpassword);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    User.findByIdAndUpdate(req.session.passport.user, {salt: salt, hash: hash})
    .then((result) => {
        res.redirect('/profile')
    })
}

export const changeMail = async (req, res) => {
    User.findById(req.session.passport.user)
    .then((user) => {
        const isValid = validPassword(req.body.passwordconfirm, user.hash, user.salt);
        if(isValid) {
            User.findByIdAndUpdate(req.session.passport.user, {mail: req.body.newmail})
            .then((result) => {
                res.redirect('/')
            })
        } else {
            res.json({ passwordNotConfirmed: true })
        }
    })
    
}

export const newAvatar =  async (req, res) => {
    const user = await User.findById(req.session.passport.user)
    const avatar = await sharp(req.file.buffer).resize({ width: 200, height: 200}).png().toBuffer()
    const avatarMini = await sharp(req.file.buffer).resize({ width: 32, height: 32 }).png().toBuffer()
    user.avatar = avatar
    user.avatarMini = avatarMini
    user.imageType = req.file.mimetype
    user.boolean.avatar = true
    user.save()
}

export const logout = async (req, res, next) => {
    req.logout();
    res.redirect('/');
};