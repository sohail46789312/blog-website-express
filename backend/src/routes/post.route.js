import express from "express"
import { createPost, deletePost, dislikePost, getAllPosts, getSinglePost, likePost } from "../controllers/post.controller.js"
import { isLoggenIn } from "../middlewares/auth.middleware.js"
import upload from "../utils/multer.js"
const router = express.Router()

router.get("/all" ,isLoggenIn, getAllPosts)
router.post("/create" ,isLoggenIn, upload.single("image"), createPost)
router.get("/:id" ,isLoggenIn, getSinglePost)
router.get("/like/:id", isLoggenIn, likePost)
router.get("/dislike/:id", isLoggenIn, dislikePost)
router.delete("/:id", isLoggenIn, deletePost)

export default router