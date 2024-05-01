import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import { setupSocketHandlers } from "./src/socketHandlers"
import authRoutes from "./src/routes/authRoutes"
import roomRoutes from "./src/routes/roomRoutes"
import messageRoutes from "./src/routes/messageRoutes"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const server = http.createServer(app)

// Middleware
app.use(express.json()) // For parsing application/json
app.use(cors()) // Enable CORS

// .env check
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined. Please set it in your .env file")
}
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined. Please set it in your .env file")
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`http://localhost:${PORT}`)
})

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
})

setupSocketHandlers(io)

app.use("/auth", authRoutes)
app.use("/rooms", roomRoutes)
app.use("/messages", messageRoutes)
