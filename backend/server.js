const express = require("express");
const env = require("dotenv");
const connectDb = require("./config/db");
const authRouter = require("./router/auth");
const userRouter = require("./router/user");
const shopRouter = require("./router/shop");
const itemRouter = require("./router/item");
const orderRouter = require("./router/order");
const cookieParser = require("cookie-parser");
const http=require("http")
const cors = require("cors");
const { Server } = require("socket.io");
const socketHandler = require("./socket");

env.config();

const app = express();
const server=http.createServer(app);


const io=new Server(server,{
   cors:{
    origin: "http://localhost:5173",
    credentials: true,
    methods:["POST","GET"]
  }
})

app.set("io",io);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

connectDb();

app.get("/", (req, res) => {
  res.send("hello");
});

//user route
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order",orderRouter)

socketHandler(io);
const port = process.env.PORT || 3003;
server.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
