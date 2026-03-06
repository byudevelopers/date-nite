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

// Logout user by clearing the session on the server side. 
export async function loginUserService({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;            // the auth session object
}

export async function logoutUserService() {
  // supabase.client keeps the current session internally,
  // so you just tell it to sign out.  If you’re passing the
  // access token yourself (e.g. via Authorization header) you
  // can call supabase.auth.setAuth(token) first.
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
}


