import { createUser, getUser, getDate } from "../database";
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
  // This function would interact with the database to set a date as favorite for the user
  // For example, it could update the user's profile in the database to include the dateId in their favorites list
  // The actual implementation would depend on how your database and user profiles are structured
}

export function getFavoriteDates(userId: string) {
  const user = getUser(userId);
  if (!user) return null;

  return user.favorites
    .map((id) => getDate(id))
    .filter((date) => date !== null);
}

export function removeFavoriteDate(userId: string, dateId: string) {
  // This function would interact with the database to remove a date from the user's favorites
  // It would update the user's profile in the database to remove the dateId from their favorites list
  // The actual implementation would depend on how your database and user profiles are structured
  const user = getUser(userId);
  if (!user) return false;
  user.favorites = user.favorites.filter((id) => id !== dateId);
  return true;
}
