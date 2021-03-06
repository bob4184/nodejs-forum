import express from 'express'
import session from 'express-session'
import passport from 'passport'
import { Strategy } from "passport-local"
import { User } from '../db/db.js'
import { validPassword } from './passprocess.js'
import MongoStore from 'connect-mongo'

import dotenv from 'dotenv'
dotenv.config()
const app = express()


function uCookie(uname) {
    app.use((session({
        name: uname,
        store: new MongoStore({ mongoUrl: process.env.MONGOOSE, collection: 'sessions' }),
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
        }
    })))
}


const verifyCallback = (username, password, done) => {
    User.findOne({ username: username })
        .then((user) => {

            if (!user) { return done(null, false) }
            
            const isValid = validPassword(password, user.hash, user.salt);
            
            if (isValid) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch((err) => {   
            done(err);
        });

}

const strategy  = new Strategy(verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});