import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Post from "../models/post.model.js"
import { uploadToCloudinary } from "../utils/cloudinary.js";
import CustomError from "../utils/customError.js";

export const getAllPosts = catchAsyncError(async (req, res, next) => {
    try {
        console.log(req.query.keyword)
        let n = req.query.page || 1;
        let limit = 10;

        const posts = await Post.find({
            title: {
                $regex: req.query.keyword,
                $options: "i"
            }
        }).limit(limit).skip((n - 1) * limit);

        res.status(200).json(posts)
    } catch (error) {
        return next(new CustomError(400, "didn't find any post"))
    }
})

export const createPost = catchAsyncError(async (req, res, next) => {
    try {
        let { title, body } = req.body

        let post

        if (req.file) {
            const result = await uploadToCloudinary(req.file.path)
            post = await Post.create({
                title,
                body,
                user: req.user._id,
                image: result.secure_url
            })
        } else {
            post = await Post.create({
                title,
                body,
                user: req.user._id
            })
        }
        post = await post.populate("user", "name image")

        res.status(200).json(post)
    } catch (error) {
        return next(new CustomError(400, "failed to create post"))
    }
})

export const getSinglePost = catchAsyncError(async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id)

        if (!post) {
            return next(new CustomError(400, "post not found with this id"))
        }

        post = await post.populate("user", "name email image")
        post = await post.populate("comments")

        res.status(200).json(post)
    } catch (error) {
        return next(new CustomError(400, "failed to find post"))
    }
})

export const likePost = catchAsyncError(async (req, res, next) => {
    try {
        let user = req.user

        if (!user) {
            return next(new CustomError(400, "user not found"))
        }

        let post = await Post.findById(req.params.id)

        if (post.likes.includes(user._id)) {
            post.likes = post.likes.filter((like) => {
                like !== user._id
            })
        } else {
            post.likes.push(user._id)
        }

        await post.save()

        res.status(200).json(post)
    } catch (error) {
        return next(new CustomError(400, "failed to like post"))
    }
})

export const dislikePost = catchAsyncError(async (req, res, next) => {
    try {
        let user = req.user

        if (!user) {
            return next(new CustomError(400, "user not found"))
        }

        let post = await Post.findById(req.params.id)

        if (post.disLikes.includes(user._id)) {
            post.disLikes = post.disLikes.filter((like) => {
                like !== user._id
            })
        } else {
            post.disLikes.push(user._id)
        }

        await post.save()

        res.status(200).json(post)
    } catch (error) {
        return next(new CustomError(400, "failed to dislike post"))
    }
})

export const deletePost = catchAsyncError(async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id)
        if (!post) {
            return next(new CustomError(400, "post not found with this id"))
        }

        await post.deleteOne()

        res.status(200).json({
            success: false,
            message: "post deleted successfully"
        })
    } catch (error) {
        return next(new CustomError(400, error.message))
    }
})