// configure dot env
import dotenv from "dotenv"
dotenv.config({ path: './.env' });

import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20'

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/v1/user/google/callback"
  },
  (token, tokenSecret, profile, done) => {
    return done(null, profile);
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });