import "express"
import { IUser } from "../../models/userModel"
import { IRoom } from "../../models/roomModel"

declare global {
  namespace Express {
    interface Request {
      user?: IUser
      room?: IRoom
    }
  }
}
