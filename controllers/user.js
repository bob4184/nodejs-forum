import date from 'date-fns'
import { Post } from '../db/db.js';
import { User } from '../db/db.js';
import { Image } from '../db/db.js';
import { Vote } from '../db/db.js';

export const userId = async (req, res) => {
    User.findById(req.params.id)
    .then((profile) => {
        Post.find({authorId: profile._id}).then((userPosts) => {
            if (req.isAuthenticated()) {
                User.findById(req.session.passport.user).then((user) => {
                    res.render('user', {Auth: req.isAuthenticated(), user, Post, date, userPosts, profile})
                })
            } else {
                res.render('user', {Auth: req.isAuthenticated(), Post, date, userPosts, profile})
            }
        })
    })
}