const passport = require("passport");
const User = require("../models/user");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
require("dotenv").config();

passport.serializeUser(User.serializeUser()); //user.serial is from passport-local-mongoose
passport.deserializeUser(User.deserializeUser());
passport.use(User.createStrategy());

var options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY
};
passport.use(
  new JwtStrategy(options, (jwt_payload, done) => {
    //jwt_pay is the extracted json
    console.log("payload", jwt_payload);
    User.findById(jwt_payload._id, (err, user) => {
      if (err) return done(err, false);
      if (user) return done(null, user);
      else return done(null, false);
    });
  })
);

module.exports = {
  getToken: user => jwt.sign(user, options.secretOrKey, { expiresIn: 3600 })
};
