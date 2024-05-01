import { Router } from "express"
import roomAccessMiddleware from "../middleware/roomMiddleware"
import { authMiddleware } from "../middleware/authMiddleware"
import Room from "../models/roomModel"
import mongoose from "mongoose"

const router = Router()

// POST /rooms: Create a new chat room
router.post("/", authMiddleware, async (req: CustomRequest, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).send("User not authenticated")
  }

  if (!req.user || !req.user._id) {
    return res.status(401).send("User not authenticated")
  }

  try {
    const participantIds = participants.map(
      (participant: string) => new mongoose.Types.ObjectId(participant)
    )
    const newRoom = await Room.createRoom(
      name,
      new mongoose.Types.ObjectId(req.user._id),
      participantIds
    )
    res.status(201).json(newRoom)
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to create room", error: error.message })
    } else {
      res.status(500).send("Unknown error occurred")
    }
  }
})

// GET /rooms/:id: Get a specific room's details, including participants and messages
router.get("/:id", authMiddleware, roomAccessMiddleware, async (req, res) => {
  // Assuming req.room is attached by roomAccessMiddleware
  if (!req.room) {
    return res.status(404).send("Room not found")
  }
  res.json(req.room)
})

// GET /rooms
router.get("/", authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).send("User not authenticated")
  }
  const rooms =
    req.user.role === "Admin"
      ? await Room.find()
      : await Room.find({ participants: req.user._id })
  res.json(rooms)
})

// PUT /rooms/:id: Update room settings or participants
router.put("/:id", authMiddleware, roomAccessMiddleware, async (req, res) => {
  if (!req.room) {
    return res.status(404).send("Room not found")
  }
  const { name, isActive } = req.body
  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.id,
    { name, isActive },
    { new: true }
  )
  res.json(updatedRoom)
})

// DELETE /rooms/:id: Delete a room
router.delete(
  "/:id",
  authMiddleware,
  roomAccessMiddleware,
  async (req, res) => {
    if (!req.room) {
      return res.status(404).send("Room not found")
    }
    await Room.findByIdAndDelete(req.params.id)
    res.status(204).send()
  }
)

export default router
