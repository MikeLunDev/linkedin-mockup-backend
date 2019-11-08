const express = require("express");
const profileRouter = require("./routes/profileRouter");
const postRouter = require("./routes/postRouter");
const cors = require("cors");
const listRoutes = require("express-list-endpoints");
const { join } = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const userRouter = require("./services/user");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
io.set("transports", ["websocket"]);
/* SOCKET IO */
io.on("connection", socket => {
  console.log("new connection", socket.id);
  // socket.on("")
});

app.set("port", process.env.PORT || 3015);
/* app.get("/", (req, res) => {
  res.send("connected");
}); */
app.use(express.json());
app.use(passport.initialize());
app.use("/poster", express.static(join(__dirname, "./public/imgs")));
app.use("/profile", cors(), profileRouter);
app.use("/post", cors(), postRouter);
app.use("/user", cors(), userRouter);

console.log(listRoutes(app));

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
    server.listen(app.get("port"), () => {
      console.log("APP IS RUNNING ON " + app.get("port"));
    })
  )
  .catch(err => console.log(err));
