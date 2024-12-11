import express from "express"
import { isLoggenIn } from "../middlewares/auth.middleware.js"
import upload from "../utils/multer.js"
import { getUser, loginUser, logoutUser, registerUser, profile, logout } from '../controllers/user.controller.js';
import passport from 'passport';
const router = express.Router()

router.get("/get/:id", isLoggenIn, getUser)
router.post("/register", upload.single("image"), registerUser)
router.post("/login", loginUser)
router.get("/local/logout", isLoggenIn, logoutUser)

router.get('/google', (req, res) => {
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res);
});
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.FRONTEND_LOGIN_ROUTE }),
    (req, res) => {
        res.redirect('/api/v1/user/profile');
    });
router.get('/profile', profile);
router.get('/logout', logout);

export default router;