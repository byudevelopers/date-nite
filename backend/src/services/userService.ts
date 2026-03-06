import { supabase, createUser } from "../database";
import { signToken } from "../utils/jwt";
import type {
  RegisterUserDTO,
  RegisterResponseDTO,
} from "@shared/user.types";

// Register user with Supabase Auth, then create user profile row
export async function registerUserService(
  userData: RegisterUserDTO,
): Promise<RegisterResponseDTO> {
  const { email, password } = userData;

  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error("User registration failed: No user id returned");
  }

  // Create user profile
  const profile = await createUser({ id: userId, email });

  // Generate JWT token
  const accessToken = signToken({
    userId: userId,
    email: email,
  });

  return {
    user: {
      id: userId,
      email: email,
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


