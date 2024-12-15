import express from "express";
import { isLoggenIn } from "../middlewares/auth.middleware.js";
import { createComment, deleteComment, deleteReply, dislikeComment, likeComment, replyComment } from "../controllers/comment.controller.js";
const router = express.Router()

router.post("/create/:id", isLoggenIn, createComment)
router.get("/like/:id", isLoggenIn, likeComment)
router.get("/dislike/:id", isLoggenIn, dislikeComment)
router.post("/reply/:id", isLoggenIn, replyComment)
router.delete("/delete/:id", isLoggenIn, deleteComment)
router.delete("/delete/reply/:id", isLoggenIn, deleteReply)

export default router