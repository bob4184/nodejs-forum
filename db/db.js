const { type } = require('express/lib/response')
const mongoose = require('mongoose')
require('dotenv').config()

const dbcon = mongoose.connect(process.env.MONGOOSE,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})


module.exports.dbcon = dbcon

const PostSchema = mongoose.Schema({
    title: {type: String, required: true},
    body: {type: String, required: true},
    author: {
        id: { type: String },
        username: {type: String}
    },
    coms: [{
        author: {
            id: {type: String},
            username: {type: String}
        },
        body: {type: String},
        written: {type: Date},
        modified: {type: Date}
    }]
}, { timestamps: true })

const Post = mongoose.model('Post', PostSchema);

module.exports.Post = Post

const UserSchema = mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    admin: Boolean,
    mail: String
}, { timestamps: true })

const User = mongoose.model('User', UserSchema);
module.exports.User = User