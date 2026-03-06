import { createUser } from "../database";
import { signToken } from "../utils/jwt";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type { RegisterUserDTO, RegisterResponseDTO } from "@shared/user.types";

// Register user with bcrypt password hashing and SQLite
export async function registerUserService(
  userData: RegisterUserDTO,
): Promise<RegisterResponseDTO> {
  const { email, password } = userData;
  const userId = randomUUID();
  const password_hash = await bcrypt.hash(password, 10);
  const profile = createUser({ id: userId, email, password_hash });
  if (!profile) throw new Error("User registration failed");
  const accessToken = signToken({ userId, email });
  return {
    user: {
      id: userId,
      email,
      favorites: profile.favorites || [],
    },
    accessToken,
  };
}
