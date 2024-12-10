import express from "express"
import { getUser, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js"
const router = express.Router()

router.get("/:id", getUser)
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/logout", logoutUser)

export default router