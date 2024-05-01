import mongoose, { Document, Model, Schema } from "mongoose"
import bcrypt from "bcrypt"

// Enum for user roles for better type safety and readability
export enum UserRole {
  Patient = "patient",
  Doctor = "doctor",
  Admin = "admin",
}

// Interface for the User document, extending Mongoose's Document
export interface IUser extends Document {
  _id: string
  email: string
  password: string
  role: UserRole
}

// Interface for the User model, extends Model with specific methods for User
interface IUserModel extends Model<IUser> {
  signup(email: string, password: string): Promise<IUser>
  login(email: string, password: string): Promise<IUser>
}

// Schema definition for the User model
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  role: {
    type: String,
    enum: Object.values(UserRole), // Enforce the role to be one of the enums
    required: true,
  },
})

// Static method to sign up a new user
userSchema.statics.signup = async function (email: string, password: string) {
  const exists = await this.findOne({ email })
  if (exists) {
    throw new Error("Email already in use")
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  // Role is set to 'Patient' by default here, no external input for role
  const user = await this.create({
    email,
    password: hash,
    role: UserRole.Patient,
  })
  return user
}

// Static method for user login
userSchema.statics.login = async function (email: string, password: string) {
  const user = await this.findOne({ email })
  if (!user) {
    throw new Error("Incorrect email")
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw new Error("Incorrect password")
  }

  return user
}

// Export the User model as a type of IUserModel for use in other parts of the application
export const User: IUserModel = mongoose.model<IUser, IUserModel>(
  "User",
  userSchema
)
