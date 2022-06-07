import express from 'express'
import session from 'express-session'
import passport from 'passport'
import './lib/passport.js'
import profileR from './routes/profile.js'
import userR from './routes/user.js'
import postsR from './routes/posts.js'
import miscR from './routes/misc.js'
import MongoStore from 'connect-mongo';
import dotenv from "dotenv"

const app = express()
const router = express.Router();

app.use(session({
    store: new MongoStore({ mongoUrl: process.env.MONGOOSE, collection: 'sessions' }),
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
dotenv.config()

app.use('/profile', profileR)
app.use('/posts', postsR)
app.use('/user', userR)
app.use('', miscR)
app.post('/login', passport.authenticate('local', { failureRedirect: '/404', successRedirect: '/profile' }));

app.listen(process.env.PORT)