import { getUserByEmail } from "../database";
import { signToken } from "../utils/jwt";
import bcrypt from "bcryptjs";
import type {
  LoginDTO,
  LoginResponseDTO,
  LogoutResponseDTO,
} from "@shared/auth.types";

export async function loginService(
  credentials: LoginDTO,
): Promise<LoginResponseDTO> {
  const { email, password } = credentials;

  // Fetch user profile
  const profile = getUserByEmail(email);

  if (!profile) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Compare password with hash
  const valid = await bcrypt.compare(password, profile.password_hash);

  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Generate JWT token
  const accessToken = signToken({
    userId: profile.id,
    email: profile.email,
  });

  return {
    user: {
      id: profile.id,
      email: profile.email,
      favorites: profile.favorites,
    },
    accessToken,
  };
}

export async function logoutService(): Promise<LogoutResponseDTO> {
  // JWT logout is client-side (delete token)
  // Future: implement token blacklisting here
  return { message: "Logout successful" };
}
