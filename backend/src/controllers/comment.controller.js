import { populate } from "dotenv";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Comment from "../models/commentModel.js"
import Post from "../models/post.model.js";
import CustomError from "../utils/customError.js";

export const createComment = catchAsyncError(async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id)

        if (!post) {
            return next(new CustomError(400, "invalid post id"))
        }

        let comment = await Comment.create({
            text: req.body.text,
            user: req.user._id,
            post: req.params.id
        })

        comment = await comment.populate("user", "name image")

        await comment.save()

        post.comments.push(comment._id)

        post = await post.populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'name image'
            }
        });

        await post.save()

        res.status(200).json(post)
    } catch (error) {
        return next(new CustomError(400, "faled to create comment"))
    }
})

export const likeComment = catchAsyncError(async (req, res, next) => {
    try {
        let user = req.user

        if (!user) {
            return next(new CustomError(400, "user not found"))
        }

        let comment = await Comment.findById(req.params.id)

        if (comment.likes.includes(user._id.toString())) {
            comment.likes = comment.likes.filter((like) => like.toString() !== user._id.toString());
        } else {
            comment.likes.push(user._id.toString());
        }

        await comment.save()

        let post = await Post.findById(comment.post).populate("comments")
        await post.save()


        res.status(200).json(post)
    } catch (error) {
        return next(new CustomError(400, "failed to like comment"))
    }
})

export const dislikeComment = catchAsyncError(async (req, res, next) => {
    try {
        let user = req.user

        if (!user) {
            return next(new CustomError(400, "user not found"))
        }

        let comment = await Comment.findById(req.params.id)

        if (comment.disLikes.includes(user._id.toString())) {
            comment.disLikes = comment.disLikes.filter((dislike) => dislike.toString() !== user._id.toString());
        } else {
            comment.disLikes.push(user._id.toString());
        }

        await comment.save()

        let post = await Post.findById(comment.post).populate("comments")
        await post.save()


        res.status(200).json(post)
    } catch (error) {
        return next(new CustomError(400, "failed to like comment"))
    }
})

export const replyComment = catchAsyncError(async (req, res, next) => {
    try {
        let comment = await Comment.findById(req.params.id)

        let reply = {
            user: req.user._id,
            text: req.body.text
        }

        comment.reply.push(reply)

        await comment.save()

        let post = await Post.findById(comment.post).populate("comments")
        await post.save()


        res.status(200).json(post)
    } catch (error) {
        return next(new CustomError(400, "failed to reply to post"))
    }
})

export const deleteComment = catchAsyncError(async (req, res, next) => {
    try {
        let comment = await Comment.findById(req.params.id)

        if(!comment) {
            return next(new CustomError(400, "comment not found with this id"))
        }

        let postId = comment.post

        let post = await Post.findById(postId)

        if (post.comments.includes(comment._id.toString())) {
            post.comments = post.comments.filter((c) => c.toString() !== comment._id.toString());
        } else {
            return next(new CustomError(400, "no comment found with this id"));
        }

        await post.save()

        await comment.deleteOne()

        res.status(200).json(post)
    } catch (error) {
        return next(new CustomError(400, error.message))
    }
})

import { Types } from 'mongoose';  // Import the ObjectId type from Mongoose

export const deleteReply = catchAsyncError(async (req, res, next) => {
    try {
        const replyId = new Types.ObjectId(req.params.id);

        const comment = await Comment.findOne({
            "reply._id": replyId
        });

        if(!comment) {
            return next(new CustomError(400, "comment not found with this id"))
        }

        let postId = comment.post

        let replies = comment.reply;

        replies = replies.filter(reply => !reply._id.equals(replyId)); 

        comment.reply = replies

        await comment.save()

        let post = await Post.findById(postId).populate("comments")

        res.status(200).json(post)
    } catch (error) {
        return next(new CustomError(500, error.message));
    }
});
