import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import CustomError from "../utils/customError.js"
import User from "../models/user.model.js"
import { sendToken } from "../utils/sendToken.js"
import bcryptjs from "bcryptjs"
import { uploadToCloudinary } from "../utils/cloudinary.js"
import crypto from "crypto"
import sendMail from "../utils/sendMail.js"

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

        let user

        const hashedPassword = await bcryptjs.hash(password, 10);

        if (req.file) {
            let result = await uploadToCloudinary(req.file.path)
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                dob,
                image: result.secure_url
            })
        } else {
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                dob,
            })
        }

        user = await User.findById(user._id).select('-password');

        sendToken(user, 200, res)
    } catch (error) {
        return next(new CustomError(500, error.message))
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

        user = await User.findOne({ email: user.email }).select("-password")

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

export const profile = catchAsyncError(async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return next(new CustomError(400, "failed to sign in with google"))
        }
        let user = await User.findOne({ email: req.user._json.email }).select("-password")
        if (user) {
            return sendToken(user, 200, res)
        }
        user = await User.create({
            name: req.user.displayName,
            email: req.user._json.email,
            password: req.user.id,
            image: req.user._json.picture
        })
        user = await User.findOne({ email: user.email }).select("-password")
        sendToken(user, 200, res)
    } catch (error) {
        return next(new CustomError(400, error.message))
    }
})

export const logout = (req, res) => {
    req.logout((err) => {
        if (err) return next(new CustomError(400, "failed to logout"));
        res.status(200).json({
            success: true,
            message: "logged out successfully"
        })
    });
};

export const deleteUser = catchAsyncError(async (req, res, next) => {
    try {
        let user = req.user

        if (!user) {
            return next(new CustomError(400, "user not found invalid token"))
        }

        await user.deleteOne()

        res.status(200).json({
            success: true,
            message: "user deleted successfully"
        })
    } catch (error) {
        return next(new CustomError(500, error.message))
    }
})

export const updateUser = catchAsyncError(async (req, res, next) => {
    let { name, dob } = req.body
    try {
        let userId = req.user._id
        let user
        if (req.file) {
            let result = await uploadToCloudinary(req.file.path)
            user = await User.findByIdAndUpdate(
                userId,
                {
                    name,
                    image: result.secure_url,
                    dob
                }
            )
        } else {
            user = await User.findByIdAndUpdate(
                userId,
                {
                    name,
                    dob
                }
            )
        }

        user = await User.findById(user._id).select('-password');

        sendToken(user, 200, res)
    } catch (error) {
        return next(new CustomError(500, error.message))
    }
})

export const changePassword = catchAsyncError(async (req, res, next) => {
    try {
        let { oldPassword, newPassword, confirmPassword } = req.body
        let userId = req.user._id
        let user = await User.findById(userId)
        if (!user) {
            return next(new CustomError(400, "user not found invalid token"))
        }
        let isPasswordMatced = await bcryptjs.compare(oldPassword, user.password)

        if (!isPasswordMatced) {
            return next(new CustomError(400, "old password is is ncorrect"))
        }

        if (newPassword !== confirmPassword) {
            return next(new CustomError(400, "password does not match"))
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json(user)
    } catch (error) {
        return next(new CustomError(500, error.message))
    }
})

export const forgotPassword = catchAsyncError(async (req, res, next) => {
    let user
    try {
        let user = await User.findOne({ email: req.body.email })
        if (!user) {
            return next(new CustomError(400, "user not found with this email"))
        }
        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetPasswordToken
        user.resetPasswordExpire = Date.now() + 1000 * 60 * 30

        await user.save()

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/user/resetpassword/${resetPasswordToken}`;
        const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
        
        await sendMail({
            email: user.email,
            subject: 'Express Blog Password Recovery',
            message
        })
        res.status(200).json({
            token: resetPasswordToken,
            user
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false });
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
})

export const resetPassword = catchAsyncError(async (req, res, next) => {
    let user
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpire: { $gt: Date.now() }
        })

        if (!user) {
            return next(new CustomError(400, "user not found invalid token"))
        }

        if (req.body.password !== req.body.confirmPassword) {
            return next(new CustomError(400, "password does not match"))
        }

        let hashedPassword = await bcryptjs.hash(req.body.password, 10)

        user.password = hashedPassword

        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save()
        res.status(200).json(user)
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false });
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
})