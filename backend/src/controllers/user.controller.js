import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import CustomError from "../utils/customError.js"
import User from "../models/user.model.js"
import { sendToken } from "../utils/sendToken.js"
import bcryptjs from "bcryptjs"

export const getUser = catchAsyncError(async (req, res, next) => {
    try {
        let user = await User.findById({ _id: req.params.id })

        if (!user) {
            return next(CustomError(400, "user does not exist with this id"))
        }

        user = await User.findById(user._id).select("-password")

        res.status(200).json(user)
    } catch (error) {
        return next(new CustomError(400, "can not get user"))
    }
})

export const registerUser = catchAsyncError(async (req, res, next) => {
    let { name, email, password, dob } = req.body
    try {
        let existingUser = await User.findOne({ email })

        if (existingUser) {
            return next(new CustomError(400, "this email already exists"))
        }

        let user = await User.create({
            name,
            email,
            password,
            dob
        })
        user = await User.findById(user._id).select('-password');

        sendToken(user, 200, res)
    } catch (error) {
        return next(new CustomError(400, "failed to register user"))
    }
})

export const loginUser = catchAsyncError(async (req, res, next) => {
    let { email, password } = req.body
    try {
        let user = await User.findOne({ email })

        if (!user) {
            return next(new CustomError(400, "email or password is incorrect"))
        }

        let isPasswordMatced = await bcryptjs.compare(password, user.password)

        if (!isPasswordMatced) {
            return next(new CustomError(400, "email or password is incorrect"))
        }

        sendToken(user, 200, res)
    } catch (error) {
        return next(new CustomError(400, "failed to login user"))
    }
})

export const logoutUser = catchAsyncError(async (req, res, next) => {
    try {
        res.status(200).cookie("token", "").json({
            success: true,
            message: "logged out successfully"
        })
    } catch (error) {
        return next(new CustomError(400, "failed to login user"))
    }
})