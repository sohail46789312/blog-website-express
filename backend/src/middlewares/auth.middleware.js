import jwt from "jsonwebtoken"
import CustomError from "../utils/customError.js"
import User from "../models/user.model.js"

export const isLoggenIn = async (req, res, next) => {
    let token = req.cookies.token
    let isAuthenticated = req.isAuthenticated()

    if (token && !isAuthenticated) {
        try {
            let decodedId;
            try {
                decodedId = jwt.verify(token, process.env.JWT_SECRET);
            } catch (error) {
                return next(new CustomError(400, "token validation vailed"))
            }

            if (!decodedId) {
                return next(new CustomError(400, "invalid token"))
            }

            let user = await User.findById(decodedId.id)

            if (!user) {
                res.cookie("token", "")
                return next(new CustomError(400, "invalid token", { expires: new Date(0) }))
            }

            req.user = user
            return next()
        } catch (error) {
            return next(new CustomError(500, "server error"));
        }
    }

    if (isAuthenticated && !token || token === "") {
        try {
            let user = await User.findOne({ email: req.user._json.email })

            if (!user) {
                return next(new CustomError(400, "invalid token"))
            }

            req.user = user

            return next()
        } catch (error) {
            return next(new CustomError(500, "server error"));
        }
    }

    return next(new CustomError(400, "you need to login first"))
}