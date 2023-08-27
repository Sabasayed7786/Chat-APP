const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const socket = require("socket.io");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

dotenv.config({ path: "./config.env" });

require("./db/conn");
const corsconfig = { origin: true, credentials: true };

app.use(express.json());
app.use(cors(corsconfig));
app.options("*", cors());

app.use(require("./router/auth"));
app.use(require("./router/messages"))

const PORT = process.env.PORT;

// const server = http.createServer(app);

app.get("/signinTransporter", (req, res) => {
  res.send(`transporte sign in`);
});

app.get("/signinManufacturer", (req, res) => {
  res.send(`Manufacturer sign in`);
});

app.get("/registerTransporter", (req, res) => {
  res.send(`Transporter Register`);
});

app.get("/registerManufacturer", (req, res) => {
  res.send(`Manufacturer Register`);
});

const server = app.listen(PORT, () => console.log(`Server started on ${PORT}`));
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
