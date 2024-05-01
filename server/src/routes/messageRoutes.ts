import { Router } from "express"
import { authMiddleware } from "../middleware/authMiddleware"
import Message from "../models/messageModel"
import { toObjectId } from "../utils/utils"

const router = Router()

// POST /messages: Send a new message
router.post("/", authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).send("Authentication required.")
  }

  const { room, content } = req.body
  const userId = toObjectId(req.user._id)
  const roomId = toObjectId(room)

  if (!userId || !roomId) {
    return res.status(400).send("Invalid user or room ID.")
  }

  try {
    const newMessage = await Message.addMessage(userId, roomId, content)
    res.status(201).json(newMessage)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    res
      .status(500)
      .json({ message: "Failed to send message", error: errorMessage })
  }
})

// GET /messages/:roomId: Retrieve messages by room
router.get("/:roomId", authMiddleware, async (req, res) => {
  const roomId = toObjectId(req.params.roomId)
  if (!roomId) {
    return res.status(400).send("Invalid room ID.")
  }

  try {
    const messages = await Message.findMessagesByRoom(roomId)
    res.json(messages)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    res
      .status(500)
      .json({ message: "Failed to retrieve messages", error: errorMessage })
  }
})

export default router
