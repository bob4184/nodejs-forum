import date from 'date-fns'
import { Post } from '../db/db.js';
import { User } from '../db/db.js';
import { Image } from '../db/db.js';
import { Vote } from '../db/db.js';

export const singlePost = async (req, res) => {
    const id = req.params.id
    Post.findById(id)
    .then((post) => {
        User.findById(post.author.id)
            .then((author) => {
                if (req.isAuthenticated()) {
                    User.findById(req.session.passport.user)
                    .then((user) => {
                        res.render('singlepost', {User, post, date, Auth: req.isAuthenticated(), user, author})
                    })
                } else {
                    res.render('singlepost', {User, post, date, Auth: req.isAuthenticated(), author})
                }
            })
    })
}

// 0:err, 1: +1; -1: -1; 2: +2; -2: -2
export const upvotePost = async (req, res) => {
    Post.findById(req.params.id).then((post) => {
        Vote.find({by: req.session.passport.user, to: req.params.id})
        .then((vote) => {
            if (vote.length > 0) {
                if (vote[0].status == -1) {
                    vote[0].status = 1;
                    vote[0].save();
                    post.votes += 2;
                    post.save()
                    res.json({ status: 1 })
                } else if (vote[0].status == 1) {
                    vote[0].delete()
                    post.votes--
                    post.save()
                    res.json({ status: 0 })
                }
            } else if (vote.length === 0) {
                post.votes++
                post.save()
                const newVote = new Vote({
                    by: req.session.passport.user,
                    to: req.params.id,
                    status: req.body.status
                })
                newVote.save()
                res.json({ status: 1 })
            }
        })
    })
}

export const downvotePost = async (req, res) => {
    Post.findById(req.params.id).then((post) => {
        Vote.find({by: req.session.passport.user, to: req.params.id})
        .then((vote) => {
            if (vote.length > 0) {
                if (vote[0].status == 1) {
                    vote[0].status = -1;
                    vote[0].save();
                    post.votes -= 2;
                    post.save()
                    res.json({ status: -1 })
                } else if (vote[0].status == -1) {
                    vote[0].delete()
                    post.votes++
                    post.save()
                    res.json({ status: 0 })
                }
            } else if (vote.length === 0) {
                post.votes--
                post.save()
                const newVote = new Vote({
                    by: req.session.passport.user,
                    to: req.params.id,
                    status: req.body.status
                })
                newVote.save()
                res.json({ status: -1 })
            }
        })
    })
}

export const commentPost = async (req, res) => {
    console.log(req.body)
    User.findById(req.session.passport.user)
    .then((currentUser) => {
        Post.updateOne({_id: req.params.id}, { $push: { coms: {author: {id: currentUser._id, username: currentUser.username}, body: req.body.com, written: new Date()} } })
        .then((result) => {
            res.json({ redirect: '/' })
        })
    })
    
}

export const deletePost = async (req, res) => {
    Post.findByIdAndDelete(req.params.id)
    .then((result) => {
        res.json({ redirect: 'http://localhost:3000/' })
    })
}

export const createPost = async (req, res) => {
    User.findById(req.session.passport.user)
    .then((user) => {
        res.render('create', {Auth: req.isAuthenticated(), user})
    })
    
}

export const createPostProcess = async (req,res) => {
    User.findById(req.session.passport.user)
    .then((currentUser) => {
        const post = new Post({
        title: req.body.title,
        body: req.body.body,
        author: {
            id: currentUser._id,
            username: currentUser.username
        },
        authorId: req.session.passport.user,
        votes: 0
        })
        post.save()
        .then(result => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        });
    })
}