import { Types } from "mongoose"

// Ensure this function is correctly converting and checking ObjectId validity
export function toObjectId(id: string | undefined): Types.ObjectId | null {
  if (id && Types.ObjectId.isValid(id)) {
    return new Types.ObjectId(id)
  }
  return null
}
