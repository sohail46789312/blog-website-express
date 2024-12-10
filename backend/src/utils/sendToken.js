import CustomError from "./customError.js"

export const sendToken = (user, statusCode, res) => {
    try {
        const token = user.getJwtToken()

        res.status(statusCode).cookie("token", token).json(user)
    } catch (error) {
        return next(CustomError(400, error.message))
    }

}