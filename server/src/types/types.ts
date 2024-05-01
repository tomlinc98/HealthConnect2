import { UserRole } from "../models/userModel"

export interface JwtPayload {
  _id: string // user's ID
  role?: UserRole // optional user role
}
