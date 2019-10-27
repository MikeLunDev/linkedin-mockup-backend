const express = require("express");
const profileRouter = require("./routes/profileRouter");
const postRouter = require("./routes/postRouter");
const cors = require("cors");
const listRoutes = require("express-list-endpoints");
const { join } = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const userRouter = require("./services/user");

const server = express();
server.set("port", process.env.PORT || 3005);
server.use(express.json());
server.use(passport.initialize());
server.use("/poster", express.static(join(__dirname, "./public/imgs")));
server.use("/profile", cors(), profileRouter);
server.use("/post", cors(), postRouter);
server.use("/user", cors(), userRouter);
console.log(listRoutes(server));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

mongoose
  .connect(
    "mongodb+srv://diegostriveschool:h6nxg5U9SDcsLA26@cluster0-3ar0p.azure.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    }
  )
  .then(
    server.listen(server.get("port"), () => {
      console.log("SERVER IS RUNNING ON " + server.get("port"));
    })
  )
  .catch(err => console.log(err));
