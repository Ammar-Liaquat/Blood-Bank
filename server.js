const dotenv = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connectdb = require("./config/db");
const routes = require("./routes/userRoutes");

const http = require("http");
const { Server } = require("socket.io");

dotenv.config({ quiet: true });

const app = express();

connectdb();

// Modules
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

const server = http.createServer(app);

//  Socket Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials:true
  },
});

//  Store online users
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // Register user
  socket.on("registerUser", (userId) => {
    onlineUsers[userId] = socket.id;

    console.log("Registered:", userId);
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    }
  });
});
app.set("io", io);
// Export for controllers
module.exports = {
  app,
  server,
  io,
  onlineUsers,
};

// Run server
const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server Running On ${port}`);
});
