import date from 'date-fns'
import { Post } from '../db/db.js';
import { User } from '../db/db.js';
import { Image } from '../db/db.js';
import { Vote } from '../db/db.js';

export const main = async (req,res) => {
    Post.find().sort({CreatedAt: -1})
    .then((result) => {
        if (req.isAuthenticated()) {
            User.findById(req.session.passport.user)
            .then((user) => {
                res.render('main', {posts: result, Auth: req.isAuthenticated(), date, user})
            })
        } else {
            res.render('main', {posts: result, Auth: req.isAuthenticated(), date})
        }
    })
}

export const login = async (req, res) => {
    res.render('login', {Auth: req.isAuthenticated()})
}

export const signup = async (req, res) => {
    res.render('signup', {Auth: req.isAuthenticated()})
}

export const signupProcess = async (req, res, next) => {
    User.findOne({username: req.body.username})
    .then((result) => {
        if(result === null) {
            console.log(req.body.pass)
            const saltHash = genPassword(req.body.pass);
    
            const salt = saltHash.salt;
            const hash = saltHash.hash;

            const newUser = new User({
                username: req.body.username,
                hash: hash,
                salt: salt,
                admin: false,
                mod: false,
                boolean: {
                    avatar: false,
                },
                mail: null
            });

            newUser.save()
                .then((user) => {
                    console.log(user);
                });
            res.redirect('/login');
        } else {
            res.json({ userAlreadyExists: true })
        }
        });
    }

    

export const uCheck = async (req, res) => {
    User.findOne({username: req.body.username})
    .then((result) => {
        if (result === null) {
            res.json({ user: false })
        } else {
            res.json({ user: true })
        }
    })
    .catch((err) => {
        console.log(err)
    })
}