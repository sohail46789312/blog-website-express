import express from "express"
const app = express()

// configure dot env
import dotenv from "dotenv"
dotenv.config()

//set parse middleware
app.use(express.json())

//set routes
import userRouter from "./src/routes/user.route.js"
app.use("/api/v1/user", userRouter)

// use errorMiddleware
import { errorMiddleware } from "./src/middlewares/error.middleware.js"
app.use(errorMiddleware)

//connect to database
import connectDb from "./src/config/database.config.js"
connectDb()

// set port variable
const port = process.env.PORT || 8000

// listen to server
app.listen(port, () => {
    console.log(`server started on port: ${port}`)
})