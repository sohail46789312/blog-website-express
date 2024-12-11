// configure dot env
import dotenv from "dotenv"
dotenv.config({ path: './.env' });

import express from "express"
import passport from 'passport';
import session from 'express-session';
import cookieParser from "cookie-parser";
import './src/middlewares/passportConfig.js';
const app = express()

// set cookie parser
app.use(cookieParser())

// set express session
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,  
  saveUninitialized: false, 
  cookie: {
    expires: new Date(Date.now() + 3600000),
    secure: false
  }
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

//set parse middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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