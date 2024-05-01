import mongoose, { Document, Schema, Model } from "mongoose"

interface IMessage extends Document {
  sender: mongoose.Types.ObjectId // Reference to the User model
  room: mongoose.Types.ObjectId // Reference to the Room model
  content: string
  timestamp: Date
}

interface IMessageModel extends Model<IMessage> {
  addMessage(
    sender: mongoose.Types.ObjectId,
    room: mongoose.Types.ObjectId,
    content: string
  ): Promise<IMessage>
  findMessagesByRoom(room: mongoose.Types.ObjectId): Promise<IMessage[]>
}

// Message schema definition
const messageSchema = new Schema<IMessage>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }, // Automatically set the timestamp when a message is created
})

// Static method to add a new message
messageSchema.statics.addMessage = async function (sender, room, content) {
  const newMessage = new this({ sender, room, content })
  return newMessage.save()
}

// Static method to find messages by room
messageSchema.statics.findMessagesByRoom = async function (room) {
  return this.find({ room }).populate("sender", "name")
}

// Export the Message model
const Message = mongoose.model<IMessage, IMessageModel>(
  "Message",
  messageSchema
)
export default Message
