import { createUser, getUser, getDate, updateUser } from "../database";
import { signToken } from "../utils/jwt";
import { randomUUID } from "crypto";
import * as bcrypt from "bcryptjs";
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

export function setFavoriteDate(userId: string, dateId: string) {
  const user = getUser(userId);
  if (!user) return false;
  if (!user.favorites.includes(dateId)) {
    user.favorites.push(dateId);
    updateUser(userId, { favorites: user.favorites });
  }
  return true;
}

export function getFavoriteDates(userId: string) {
  const user = getUser(userId);
  if (!user) return null;

  return user.favorites
    .map((id) => getDate(id))
    .filter((date) => date !== null);
}

export function removeFavoriteDate(userId: string, dateId: string) {
  const user = getUser(userId);
  if (!user) return false;
  const updated = user.favorites.filter((id) => id !== dateId);
  updateUser(userId, { favorites: updated });
  return true;
}
