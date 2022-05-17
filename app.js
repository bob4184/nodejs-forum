const express = require('express')
const app = express()
const session = require('express-session')
var passport = require('passport');
require('./lib/passport')
var crypto = require('crypto')
const genPassword = require('./lib/passprocess').genPassword;
const dbcon = require('./db/db.js').dbcon
const isAuth = require('./lib/side').isAuth;
const isAdmin = require('./lib/side').isAdmin;
const MongoStore = require('connect-mongo')
const date = require('date-fns')
const cookieParser = require('cookie-parser')
const validPassword = require('./lib/passprocess.js').validPassword
const Post = require('./db/db.js').Post
const User = require('./db/db.js').User

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

// app.use(cookieParser())
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
require('dotenv').config()



app.get('/', (req,res) => {
    Post.find().sort({CreatedAt: -1})
    .then((result) => {
        res.render('main', {posts: result, Auth: req.isAuthenticated()})
    })
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/404', successRedirect: '/profile' }));

app.post('/signup', (req, res, next) => {
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
    })

    

app.post('/signup/AUCheck', (req, res) => {
    User.findOne({username: req.body.username})
    .then((result) => {
        if (result === null) {
            res.json({ user: false })
            console.log("false json sent")
        } else {
            res.json({ user: true })
            console.log("true json sent")
        }
    })
    .catch((err) => {
        console.log(err)
    })
})

app.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

app.get('/create', isAuth, (req, res) => {
    res.render('create', {Auth: req.isAuthenticated()})
})

app.post('/create', (req,res) => {
    User.findById(req.session.passport.user)
    .then((currentUser) => {
        const post = new Post({
        title: req.body.title,
        body: req.body.body,
        author: {
            id: currentUser._id,
            username: currentUser.username
        }
        })
        post.save()
        .then(result => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        });
    })
    })
    

app.get('/posts/:id', (req, res) => {
    const id = req.params.id
    Post.findById(id)
    .then((post) => {
        User.findById(post.author.id)
            .then((author) => {
                if (req.isAuthenticated()) {
                    User.findById(req.session.passport.user)
                    .then((user) => {
                        res.render('singlepost', {User: User, post: post, date: date, Auth: req.isAuthenticated(), user: user, author: author})
                    })
                } else {
                    res.render('singlepost', {User: User, post: post, date: date, Auth: req.isAuthenticated(), author: author})
                }
            })
    })
})

app.post('/posts/:id/com', (req, res) => {
    console.log(req.body)
    User.findById(req.session.passport.user)
    .then((currentUser) => {
        Post.updateOne({_id: req.params.id}, { $push: { coms: {author: {id: currentUser._id, username: currentUser.username}, body: req.body.com, written: new Date()} } })
        .then((result) => {
            res.json({ redirect: '/' })
        })
    })
    
})

app.delete('/posts/:id', (req, res) => {
    Post.findByIdAndDelete(req.params.id)
    .then((result) => {
        res.json({ redirect: 'http://localhost:3000/' })
    })
})

app.get('/profile', isAuth, (req, res) => {
    User.findById(req.session.passport.user)
    .then((user) => {
        var allUserPosts = []
        Post.find({author: {authorId: user._id}})
        .then((userPosts) => {
            console.log(user._id)
            console.log(userPosts)
            allUserPosts.push(userPosts)
            console.log(allUserPosts)
            res.render('profile', {Auth: req.isAuthenticated(),User: user, Post, date, allUserPosts: allUserPosts})
        })
        
    })
    
})

app.get('/profile/settings', isAuth, (req, res) => {
    User.findById(req.session.passport.user)
    .then((result) => {
        res.render('profileset', {User: result, Auth: req.isAuthenticated()})
    })
})

app.post('/profile/settings/changeusername', (req, res) => {
    User.findOne({username: req.body.newusername})
    .then((result) => {
        if (result === null) {
            User.findByIdAndUpdate(req.session.passport.user, {username: req.body.newusername})
            .then((result) => {
                res.redirect('/profile')
                console.log('code 1 sent')
            })
            
        } else {
            res.json({ usernameAvailable: 0})
            console.log('code 0 sent')
        }
    })
})

app.post('/profile/settings/changepassword', (req, res) => {
    const saltHash = genPassword(req.body.newpassword);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    User.findByIdAndUpdate(req.session.passport.user, {salt: salt, hash: hash})
    .then((result) => {
        res.redirect('/profile')
    })
})

app.post('/profile/settings/changemail', (req, res) => {
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
    
})

app.get('/login', (req, res) => {
    res.render('login', {Auth: req.isAuthenticated()})
})

app.get('/signup', (req, res) => {
    res.render('signup', {Auth: req.isAuthenticated()})
})



app.listen(3000)