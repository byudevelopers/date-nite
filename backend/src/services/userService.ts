import { supabase, createUser } from "../database";

// Register user with Supabase Auth, then create user profile row
export async function registerUserService({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  favorites?: string[];
  username?: string;
}) {
  // Build signUp args conditionally to avoid TypeScript type errors
  const signUpArgs: any = { email, password };
  if (username) {
    signUpArgs.options = { data: { username } };
  }
  const { data: authData, error: authError } =
    await supabase.auth.signUp(signUpArgs);
  if (authError) throw authError;
  const userId = authData.user?.id;
  if (!userId) throw new Error("User registration failed: No user id returned");
  // Create user profile row
  const profile = await createUser({ id: userId, email });
  return { auth: authData, profile };
}
