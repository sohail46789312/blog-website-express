import mongoose from "mongoose";

// configure dot env
import dotenv from "dotenv"
dotenv.config()

function connectDb () {
    mongoose.connect(process.env.DB_URI).then(() => {
        console.log("connected to database")
    }).catch(() => {
        console.log("failed to connect database")
    })
}

export default connectDb