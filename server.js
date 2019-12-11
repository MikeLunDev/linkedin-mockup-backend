const express = require("express");
const profileRouter = require("./routes/profileRouter");
const postRouter = require("./routes/postRouter");
const messageRouter = require("./routes/messageRouter");
const cors = require("cors");
const listRoutes = require("express-list-endpoints");
const { join } = require("path");
const YAML = require("yamljs");
const swaggerUI = require("swagger-ui-express");
const mongoose = require("mongoose");
const passport = require("passport");
const userRouter = require("./services/user");
const http = require("http");
const { saveMsgOnDB } = require("./helperSocketIo");

const swaggerDocument = YAML.load(join(__dirname, "./apidocs.yaml"));

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
io.set("transports", ["websocket"]);
/* SOCKET IO */
var users = {};
io.on("connection", socket => {
  console.log("new connection", socket.id);
  socket.on("chatMsg", msg => {
    saveMsgOnDB(msg);
    io.to(msg.to).emit("chatMsg", { text: msg.text, from: msg.from });
  });
});

app.set("port", process.env.PORT || 3015);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use(express.json());
app.use(passport.initialize());
app.use("/poster", express.static(join(__dirname, "./public/imgs")));
app.use("/profiles", cors(), profileRouter);
app.use("/post", cors(), postRouter);
app.use("/msg", cors(), messageRouter);
app.use("/user", cors(), userRouter);

console.log(listRoutes(app));

let connectDbUri =
  "mongodb+srv://diegostriveschool:h6nxg5U9SDcsLA26@cluster0-3ar0p.azure.mongodb.net/test?retryWrites=true&w=majority";
if (process.env.NODE_ENV === "test") {
  connectDbUri = "mongodb://localhost:27017/testdb";
}

mongoose
  .connect(connectDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .catch(error => {
    console.log(error);
  });

server.listen(app.get("port"), () => {
  console.log("APP IS RUNNING ON " + app.get("port"));
});

module.exports = { app, server };
