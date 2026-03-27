import { v4 as uuidv4 } from 'uuid';

// In-memory storage
interface User {
  id: string;
  email: string;
  password: string;  // In production, this should be hashed!
  favorites?: string[] | undefined;
}

interface Session {
  userId: string;
  accessToken: string;
  email: string;
}

// These lists store everything in memory
const users: User[] = [];
const sessions: Session[] = [];

// AUTH FUNCTIONS (replacing Supabase Auth)
export const mockAuth = {
  // Sign up a new user
  signUp: async ({ email, password }: { email: string; password: string }) => {
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return { 
        data: null, 
        error: { message: 'User already exists' } 
      };
    }

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email,
      password,  // WARNING: NOT HASHED - fine for testing only!
      favorites: []
    };

    users.push(newUser);

    return {
      data: {
        user: {
          id: newUser.id,
          email: newUser.email
        }
      },
      error: null
    };
  },

  // Sign in existing user
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return {
        data: null,
        error: { message: 'Invalid credentials' }
      };
    }

    // Create session
    const accessToken = uuidv4(); // Simple token generation
    const session: Session = {
      userId: user.id,
      accessToken,
      email: user.email
    };
    
    sessions.push(session);

    return {
      data: {
        user: {
          id: user.id,
          email: user.email
        },
        session: {
          access_token: accessToken
        }
      },
      error: null
    };
  },

  // Sign out
  signOut: async () => {
    // In a real implementation, you'd remove the specific session
    // For simplicity, we'll just return success
    return { error: "error" };
  }
};

// DATABASE FUNCTIONS (replacing Supabase Database)
export async function getUser(id: string) {
  const user = users.find(u => u.id === id);
  if (!user) throw new Error('User not found');
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function createUser(user: {
  id: string;
  email: string;
  favorites?: string[];
}) {
  // User already exists in auth, just return it
  const existingUser = users.find(u => u.id === user.id);
  if (existingUser) {
    const { password, ...userWithoutPassword } = existingUser;
    return userWithoutPassword;
  }
  
  return user;
}

export async function updateUser(
  id: string,
  updates: Partial<{ email: string; favorites: string[] }>
) {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) throw new Error('User not found');
  
  const updatedUser: User = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  
  const { password, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
}

export async function deleteUser(id: string) {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) throw new Error('User not found');
  
  users.splice(userIndex, 1);
  return { success: true };
}

// Helper to view all users (for debugging)
export function getAllUsers() {
  return users.map(({ password, ...user }) => user);
}