import { mockAuth, createUser } from "../mockDatabase";  // Changed from database
import { signToken } from "../utils/jwt";
import type {
  RegisterUserDTO,
  RegisterResponseDTO,
} from "@shared/user.types";

// Register user with mock auth
export async function registerUserService(
  userData: RegisterUserDTO,
): Promise<RegisterResponseDTO> {
  const { email, password } = userData;

  // Create auth user (replaces supabase.auth.signUp)
  const { data: authData, error: authError } = await mockAuth.signUp({
    email,
    password,
  });

  if (authError) throw new Error(authError.message);

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
    },
    accessToken,
  };
}

// Login user
export async function loginUserService({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await mockAuth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function logoutUserService() {
  const { error } = await mockAuth.signOut();
  if (error) throw new Error(error);
  return { success: true };
}