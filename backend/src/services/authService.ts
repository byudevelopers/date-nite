import { supabase, getUserByEmail } from "../database";
import { signToken } from "../utils/jwt";
import type {
  LoginDTO,
  LoginResponseDTO,
  LogoutResponseDTO,
} from "@shared/auth.types";

export async function loginService(
  credentials: LoginDTO,
): Promise<LoginResponseDTO> {
  const { email, password } = credentials;

  // Authenticate with Supabase
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Fetch user profile
  const profile = await getUserByEmail(email);

  // Generate JWT token (not Supabase token)
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
