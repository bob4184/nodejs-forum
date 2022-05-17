const { nextDay } = require('date-fns');
const express = require('express')
const session = require('express-session')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../db/db.js').User
const validPassword = require('./passprocess.js').validPassword;
const MongoStore = require('connect-mongo')

require('dotenv').config()
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

const strategy  = new LocalStrategy(verifyCallback);

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