import mongoose, { Document, Schema, Model } from "mongoose"

export interface IRoom extends Document {
  name: string
  participants: Schema.Types.ObjectId[]
  isActive: boolean
  messages: Schema.Types.ObjectId[]
}

interface IRoomModel extends Model<IRoom> {
  createRoom(
    name: string,
    creatorId: mongoose.Types.ObjectId,
    participants: mongoose.Types.ObjectId[]
  ): Promise<IRoom>
  findRoomsByUser(
    userId: mongoose.Types.ObjectId,
    userRole: string
  ): Promise<IRoom[]>
  updateRoomParticipants(
    roomId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    action: "add" | "remove"
  ): Promise<IRoom>
  toggleActiveCall(
    roomId: mongoose.Types.ObjectId,
    isActive: boolean
  ): Promise<IRoom>
  deleteRoom(
    roomId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    userRole: string
  ): Promise<IRoom>
}

const roomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isActive: { type: Boolean, default: false },
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
})

// Static method to create a new room
roomSchema.statics.createRoom = async function (
  name: string,
  creatorId: mongoose.Types.ObjectId,
  participants: mongoose.Types.ObjectId[]
) {
  const newRoom = new this({
    name,
    participants: [creatorId, ...participants], // Creator is also a participant
    isActive: false,
  })
  return newRoom.save()
}

// Static method to find rooms by user
roomSchema.statics.findRoomsByUser = async function (
  userId: mongoose.Types.ObjectId,
  userRole: string
) {
  if (userRole === "Admin") {
    return this.find() // Admins can see all rooms
  }
  return this.find({ participants: userId }) // Other users see only their rooms
}

// Static method to update room participants
roomSchema.statics.updateRoomParticipants = async function (
  roomId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  action: "add" | "remove"
) {
  const room = await this.findById(roomId)
  if (!room) throw new Error("Room not found")

  if (action === "add") {
    room.participants.push(userId)
  } else if (action === "remove") {
    // Explicitly type the participantId as mongoose.Types.ObjectId
    room.participants = room.participants.filter(
      (participantId: mongoose.Types.ObjectId) => !participantId.equals(userId)
    )
  }

  return room.save()
}

// Static method to toggle the active call status
roomSchema.statics.toggleActiveCall = async function (
  roomId: mongoose.Types.ObjectId,
  isActive: boolean
) {
  const room = await this.findById(roomId)
  if (!room) throw new Error("Room not found")

  room.isActive = isActive
  return room.save()
}

// Static method to delete a room
roomSchema.statics.deleteRoom = async function (
  roomId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  userRole: string
) {
  const room = await this.findById(roomId)
  if (!room) {
    throw new Error("Room not found")
  }

  // Allow deletion if the user is an admin or the creator
  if (userRole === "Admin" || room.participants.includes(userId)) {
    return this.findByIdAndDelete(roomId)
  } else {
    throw new Error("Not authorized to delete this room")
  }
}

// Export the Room model
const Room = mongoose.model<IRoom, IRoomModel>("Room", roomSchema)
export default Room
