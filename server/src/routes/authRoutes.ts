import { Router } from "express"
import { User } from "../models/userModel"
import jwt from "jsonwebtoken"

const router = Router()

// Helper function to generate JWT including user role
const generateToken = (id: string, role: string) => {
  return jwt.sign({ _id: id, role: role }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  })
}

// POST /auth/register
router.post("/register", async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.signup(email, password)
    const token = generateToken(user._id.toString(), user.role)

    res.status(201).json({ token, userId: user._id, role: user.role })
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error registering new user", error: error.message })
    } else {
      res.status(500).json({
        message: "Error registering new user",
        error: "An unknown error occurred",
      })
    }
  }
})

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.login(email, password)
    const token = generateToken(user._id.toString(), user.role)
    res.json({ token, userId: user._id, role: user.role })
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error logging in", error: error.message })
    } else {
      res.status(500).json({
        message: "Error logging in",
        error: "An unknown error occurred",
      })
    }
  }
})

export default router
