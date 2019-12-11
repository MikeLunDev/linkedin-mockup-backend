const express = require("express");
const passport = require("passport");
var Profiles = require("../models/profiles");
var Experiences = require("../models/experience");
const User = require("../models/user");
const profileRouter = express.Router();

profileRouter.get("/", (req, res) => {
  Profiles.find({}).then(app => {
    res.status(200).json(app);
  });
});

profileRouter.post("/testdb", async (req, res) => {
  var newUser = new User({
    email: req.body.email,
    password: req.body.password
    //user: check != null ? check.toObject().username : undefined
  });
  newUser = await User.register(newUser, req.body.password);
  res.status(201).send(newUser);
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
  Profiles.findOne({ email: req.params.email })
    .then(
      app => {
        app ? res.status(200).send(app) : res.status(404).send("Not Found");
      },
      err => next(err)
    )
    .catch(err => next(err));
});

profileRouter.get(
  "/:email/experiences",
  passport.authenticate("jwt"),
  async (req, res) => {
    var experienceFromEmail = await Experiences.find({
      email: req.params.email
    });
    if (experienceFromEmail.length > 0)
      res.status(200).json(experienceFromEmail);
    else res.status(404).json("not found");
  }
);

profileRouter
  .route("/experiences")
  .post(passport.authenticate("jwt"), async (req, res) => {
    req.body.email = req.user.email;
    if (req.user.user != undefined) req.body.username = req.user.user;
    try {
      var exp = await Experiences.create(req.body);
      res.status(201).json(exp);
    } catch (err) {
      console.log(err);
      res.statusCode = 400;
      res.json({
        error: err.message
      });
    }
  });

profileRouter.get(
  "/experiences/:expId",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      var experience = await Experiences.findById({ _id: req.params.expId });
      res.status(200).json(experience);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }
);
profileRouter.put(
  "/experiences/:expId",
  passport.authenticate("jwt"),
  async (req, res) => {
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
  }
);
profileRouter.delete(
  "/experiences/:expId",
  passport.authenticate("jwt"),
  async (req, res) => {
    var exp = await Experiences.findById(req.params.expId);
    if (exp.email == req.user.email || exp.username === req.user.user) {
      await Experiences.findByIdAndDelete(req.params.expId);
      res.send("Deleted");
    } else {
      res.status(401);
      res.send("Unauthorized");
    }
  }
);

module.exports = profileRouter;
