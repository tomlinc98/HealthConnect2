import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { Socket } from "socket.io"
import { ExtendedError } from "socket.io/dist/namespace"
import { JwtPayload } from "../types/types" // Ensure this matches token structure
import { User } from "../models/userModel"
import { CustomRequest } from "../types/customRequest" // Update the import path

export const authenticate = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
  } catch (error) {
    return null
  }
}

export const authMiddleware = async (
  req: CustomRequest, // Assuming this is imported correctly
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" })
  }
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).send("Authentication token required")
    return
  }

  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    const user = await User.findById(decoded._id)
    if (!user) {
      res.status(404).send("User not found")
      return
    }

    req.user = user // Assume IUser is compatible with JwtPayload
    next()
  } catch (error) {
    res.status(401).send("Invalid or expired token")
  }
}

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const token = socket.handshake.query.token as string
  if (!token) {
    return next(new Error("Authentication error: Token required"))
  }

  const user = authenticate(token)
  if (!user) {
    return next(new Error("Authentication error: Invalid or expired token"))
  }

  socket.data.user = user // Verify this line is handling types correctly
  next()
}

export const roleMiddleware = (roles: Array<string>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Insufficient permissions" })
      return
    }
    next()
  }
}
