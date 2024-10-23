import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import auth from "./routes/auth.js";
import user from "./routes/user.js";
import startup from "./routes/startup.js";
import investmentInstitution from "./routes/investmentInstitution.js";
import chat from "./routes/chat.js";
import payment from "./routes/payment.js";
import config from "./config.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "node:http";
import chatHandlers from "./socketHandler/chatHandler.js";
import userHandlers from "./socketHandler/userHandler.js";

const PORT = 8080;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

//middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());

//routes
app.use("/payment", payment);
app.use(express.json());
app.use("/auth", auth);
app.use("/users", user);
app.use("/startups", startup);
app.use("/investment-institutions", investmentInstitution);
app.use("/chat", chat);

io.listen(4000);

io.on("connection", (socket) => {
  console.log("a user connected");
  chatHandlers(socket, io);
  userHandlers(socket);
});

mongoose
  .connect(config.mongoDbUrl)
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
