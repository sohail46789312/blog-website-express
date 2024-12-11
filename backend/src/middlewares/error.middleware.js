import CustomError from "../utils/customError.js";

export const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    let error = { ...err };

    error.message = err.message;

    // Mongoose Cast Error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        error = new CustomError(400, message);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(value => value.message).join(", ");
        error = new CustomError(400, message);
    }

    // Duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        error = new CustomError(400, message);
    }

    // Invalid JWT Error
    if (err.name === 'JsonWebTokenError') {
        const message = 'JSON Web Token is invalid. Try Again!';
        error = new CustomError(400, message);
    }

    // Expired JWT Error
    if (err.name === 'TokenExpiredError') {
        const message = 'JSON Web Token is expired. Try Again!';
        error = new CustomError(400, message);
    }

    // Send the error response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
    });
};
