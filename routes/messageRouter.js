const express = require("express");
const Messages = require("../models/message");

var router = express.Router();

router.get("/", async (req, res) => {
  res.send(await Messages.find({}));
});

module.exports = router;
