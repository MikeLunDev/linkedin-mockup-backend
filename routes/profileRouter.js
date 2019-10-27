const express = require("express");
const passport = require("passport");
var Profiles = require("../models/profiles");
var Experiences = require("../models/experience");

const profileRouter = express.Router();

profileRouter.get("/", (req, res) => {
  Profiles.find({}).then(app => {
    res.json(app);
  });
});

profileRouter.route("/").put(passport.authenticate("jwt"), (req, res, next) => {
  delete req.body.email;
  delete req.body.password;
  Profiles.findOneAndUpdate(
    { email: req.user.email },
    { $set: req.body },
    { new: true }
  )
    .then(
      app => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(app);
      },
      err => next(err)
    )
    .catch(err => next(err));
});

profileRouter.get("/me", passport.authenticate("jwt"), (req, res) => {
  Profiles.findOne({ email: req.user.email })
    .then(
      app => {
        res.json(app);
      },
      err => next(err)
    )
    .catch(err => next(err));
});

profileRouter.get("/:email", passport.authenticate("jwt"), (req, res) => {
  Profiles.findOne({ email: req.user.email })
    .then(
      app => {
        res.json(app);
      },
      err => next(err)
    )
    .catch(err => next(err));
});

profileRouter.get("/experiences/:user", async (req, res) => {
  console.log("I'M INSIDE USERNAME/EXPERIENCES", req.user);
  var experienceFromUsername = await Experiences.find({
    username: req.params.user
  });
  res.json(experienceFromUsername);
});

profileRouter
  .route("/:email/experiences")
  .get(async (req, res) => {
    var experienceFromMail = await Experiences.find({
      email: req.params.email
    });
    res.json(experienceFromMail);
  })
  .post(passport.authenticate("jwt"), async (req, res) => {
    req.body.email = req.user.email;
    if (req.user.user != undefined) req.body.username = req.user.user;
    try {
      var exp = await Experiences.create(req.body);
      res.json(exp);
    } catch (err) {
      console.log(err);
      res.statusCode = 400;
      res.json({
        error: err
      });
    }
  });

profileRouter
  .route("/:userName/experiences/:expId")
  .get(async (req, res) => {
    res.json(await Experiences.findById(req.params.expId));
  })
  .put(passport.authenticate("jwt"), async (req, res) => {
    var exp = await Experiences.findById(req.params.expId);
    if (exp.username == req.user.user) {
      var updated = await Experiences.findByIdAndUpdate(req.params.expId, {
        $set: req.body
      });
      res.json(updated);
    } else {
      res.status(401);
      res.send("Unauthorized");
    }
  })
  .delete(passport.authenticate("jwt"), async (req, res) => {
    var exp = await Experiences.findById(req.params.expId);
    if (exp.email == req.user.email || exp.username === req.user.user) {
      await Experiences.findByIdAndDelete(req.params.expId);
      res.send("Deleted");
    } else {
      res.status(401);
      res.send("Unauthorized");
    }
  });

module.exports = profileRouter;
