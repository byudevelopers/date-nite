import { supabase, createUser } from "../database";

// Register user with Supabase Auth, then create user profile row
export async function registerUserService({
  email,
  password,
  favorites = [],
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
  const profile = await createUser({ id: userId, email, favorites });
  return { auth: authData, profile };
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


