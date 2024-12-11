import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs"

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minLength: 3,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
        },
        dob: {
            type: Date,
            default: 0
        },
        image: {
            type: String
        }
    },
    { timestamp: true }
);

userSchema.pre("save", function () {
    let hashedPassword = bcryptjs.hashSync(this.password, 10)
    this.password = hashedPassword
})

userSchema.methods.getJwtToken = function () {
    const token = jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME
    })

    return token
}

export default mongoose.model("user", userSchema)