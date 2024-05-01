import { Request } from "express"
import { IUser } from "../models/userModel"
import { IRoom } from "../models/roomModel"

export interface CustomRequest extends Request {
  user?: IUser & { _id: string }
  room?: IRoom
}
