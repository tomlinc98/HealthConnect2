import { Response, NextFunction } from "express"
import Room from "../models/roomModel"
import { UserRole } from "../models/userModel"
import { toObjectId } from "../utils/utils"
import { CustomRequest } from "../types/customRequest"

const roomAccessMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const roomId = req.params.roomId
  const objectId = toObjectId(roomId)

  if (!objectId) {
    res.status(400).send("Invalid Room ID provided.")
    return
  }

  const room = await Room.findById(objectId)
  if (!room) {
    res.status(404).send("Room not found")
    return
  }

  if (!req.user) {
    res.status(401).send("User not authenticated")
    return
  }

  const userId = req.user._id.toString()
  const isAdmin = req.user.role === UserRole.Admin // Use the enum for comparison
  const isParticipant = room.participants.some(
    (participant) => participant.toString() === userId
  )

  if (isParticipant || isAdmin) {
    req.room = room // Attach room to request
    next()
  } else {
    res.status(403).send("Not authorized to access this room")
  }
}

export default roomAccessMiddleware
