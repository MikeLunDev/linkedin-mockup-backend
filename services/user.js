const express = require("express");
const User = require("../models/user");
const Profiles = require("../models/profiles");
const passport = require("passport");
const { getToken } = require("../authentication/auth");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (email === undefined || password === undefined) {
    res.statusCode = 400;
    res.json({
      status: "email or password missing",
      success: false
    });
  } else {
    var check = await Profiles.findOne({ email: email });
    if (
      check === null ||
      (check !== null && check.toObject().username != undefined)
    ) {
      try {
        var newUser = new User({
          email: email,
          password: password,
          user: check != null ? check.toObject().username : undefined
        });
        newUser = await User.register(newUser, password);
        if (check !== null) {
          console.log("I'M HEREE");
          res.json({
            status: "New user created",
            success: true,
            user: newUser
          });
        } else {
          try {
            await Profiles.create(req.body);
            res.json({
              status: "New user created",
              success: true,
              user: newUser
            });
          } catch (err) {
            console.log("error in creating a profile", err.message);
            await User.findOneAndRemove({ email: email });
            res.statusCode = 500;
            res.send(err.message);
          }
        }
      } catch (err) {
        console.log("I'M HEREEEEEEEEEEEE", err);
        res.statusCode = 500;
        res.send(err);
      }
    } else {
      res.statusCode = 400;
      res.json({
        success: false,
        status: "User already exist"
      });
    }
  }
});

router.delete("/remove", async (req, res) => {
  var toRemove = await User.findOneAndRemove({ email: req.body.email });
  var toRemove2 = await Profiles.findOneAndRemove({ email: req.body.email });
  var toRemove = res.send(toRemove);
});

router.get("/", async (req, res) => {
  var toFind = await User.find({});
  console.log(toFind);
  res.send(toFind);
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  var token = getToken({
    _id: req.user._id,
    email: req.user.email,
    user: req.user.user
  });
  res.send({ token: token, success: true });
});

router.post("/refresh", passport.authenticate("jwt"), (req, res) => {
  var token = getToken({
    _id: req.user._id,
    email: req.user.email,
    user: req.user.user
  });
  res.send({
    success: true,
    token: token
  });
});

module.exports = router;
