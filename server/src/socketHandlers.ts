import { Server as SocketIOServer } from "socket.io"
import Message from "./models/messageModel"
import jwt from "jsonwebtoken"
import { JwtPayload } from "../src/types/types"

declare module "socket.io" {
  interface Socket {
    userId?: string // TypeScript extension for Socket interface
  }
}

export function setupSocketHandlers(io: SocketIOServer) {
  io.on("connection", (socket) => {
    socket.on("authenticate", (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
        socket.userId = decoded._id // Assign decoded user ID to the socket
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Authentication error:", error.message) // Emitting specific error to the client
        } else {
          console.error("Authentication error: Unknown error")
        }
        socket.emit("authentication_error", "Failed to authenticate")
        socket.disconnect()
      }
    })

    socket.on("room-message", async ({ roomId, message }) => {
      if (!socket.userId) {
        socket.emit("error", "User not authenticated")
        return // Early return if user ID isn't set
      }

      try {
        const newMessage = new Message({
          sender: socket.userId,
          room: roomId,
          content: message,
          timestamp: new Date(),
        })

        await newMessage.save()
        io.to(roomId).emit("new-message", newMessage) // Emit the new message to the room
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error saving message:", error.message)
        } else {
          console.error("Error saving message: Unknown error")
        }
      }
    })

    // Additional handlers...
  })
}
