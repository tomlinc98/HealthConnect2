import { Router } from "express"
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware"
import { User, IUser, UserRole } from "../models/userModel" // Ensure User and UserRole are imported
import bcrypt from "bcrypt"

const router = Router()

// GET /users/me: Retrieve the current user's profile
router.get("/me", authMiddleware, (req, res) => {
  if (!req.user) return res.status(401).send("Authentication required.")
  res.json(req.user)
})

// PUT /users/me: Update current user's profile
router.put("/me", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).send("Authentication required.")

  const user = req.user as IUser
  const updates = req.body
  const allowedUpdates = ["email", "password"]

  try {
    if (allowedUpdates.includes("email") && typeof updates.email === "string") {
      user.email = updates.email
    }
    if (
      allowedUpdates.includes("password") &&
      typeof updates.password === "string"
    ) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(updates.password, salt)
    }

    await user.save()
    res.json(user)
  } catch (error) {
    res.status(400).send({
      message: "Failed to update user",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// DELETE /users/me: Delete current user
router.delete("/me", authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).send("Authentication required.")

  const user = req.user as IUser
  try {
    await user.deleteOne()
    res.send({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).send({
      message: "Failed to delete user",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// PUT /users/:id/role - Update user's role (admin only)
router.put(
  "/:id/role",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    const { role } = req.body
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).send("Invalid role specified")
    }

    try {
      const user = await User.findById(req.params.id)
      if (!user) {
        return res.status(404).send("User not found")
      }

      user.role = role
      await user.save()
      res.send({ message: `Updated user role to ${role}` })
    } catch (error) {
      res.status(500).send({
        message: "Failed to update user role",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
)

export default router
