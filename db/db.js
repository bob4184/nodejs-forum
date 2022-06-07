import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

export const dbcon = mongoose.connect(process.env.MONGOOSE,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})


const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    body: {type: String, required: true},
    author: {
        id: { type: String },
        username: {type: String}
    },
    authorId: {type: String},
    coms: [{
        author: {
            id: {type: String},
            username: {type: String}
        },
        body: {type: String},
        written: {type: Date},
        modified: {type: Date}
    }],
    votes: {type: Number}
}, { timestamps: true })
export const Post = mongoose.model('Post', postSchema);

const userSchema = mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    admin: Boolean,
    mod: Boolean,
    avatar: Buffer,
    avatarMini: Buffer,
    boolean: {
        avatar: Boolean,
    },
    imageType: String,
    mail: String
}, { timestamps: true })
export const User = mongoose.model('User', userSchema);

const imageSchema = mongoose.Schema({
    avatarId: String,
    postId: String,
    contentType: String,
    data: Buffer
})
export const Image = mongoose.model('Image', imageSchema)

const voteSchema = mongoose.Schema({
    by: String,
    to: String,
    status: Number
})
export const Vote = mongoose.model('Votes', voteSchema)