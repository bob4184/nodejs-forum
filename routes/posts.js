import express from "express"
import { singlePost } from '../controllers/posts.js'
import { upvotePost } from "../controllers/posts.js"
import { downvotePost } from "../controllers/posts.js"
import { commentPost } from "../controllers/posts.js"
import { deletePost } from "../controllers/posts.js"
import { createPost } from "../controllers/posts.js"
import { createPostProcess } from "../controllers/posts.js"
import { isAuth } from '../lib/side.js';
import { isAdmin } from '../lib/side.js';


const router = express.Router()

router.get('/:id', singlePost)
router.post('/:id/upvote', upvotePost)
router.post('/:id/downvote', downvotePost)
router.post('/:id/com', commentPost)
router.delete('/:id', deletePost)
router.get('/create', createPost)
router.post('/create', createPostProcess)

export default router