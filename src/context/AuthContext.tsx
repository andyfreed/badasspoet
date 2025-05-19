'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  availableUsernames: { id: number; username: string; is_taken: boolean }[];
  fetchUsernames: () => Promise<void>;
  selectedUsername: string | null;
  setSelectedUsername: (username: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableUsernames, setAvailableUsernames] = useState<
    { id: number; username: string; is_taken: boolean }[]
  >([]);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  useEffect(() => {
    // Setup auth state listener
    const setupAuthListener = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`Auth event: ${event}`);
          setSession(session);
          setUser(session?.user || null);
        }
      );

      setLoading(false);
      
      // Fetch usernames on initial load
      fetchUsernames();

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    setupAuthListener();
  }, []);

  // Fetch available usernames
  const fetchUsernames = async () => {
    try {
      const { data, error } = await supabase
        .from('usernames')
        .select('*')
        .order('username');

      if (error) {
        console.error('Error fetching usernames:', error);
        return;
      }

      setAvailableUsernames(data || []);
    } catch (err) {
      console.error('Error in fetchUsernames:', err);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, username: string) => {
    try {
      // First register the user with options to disable email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: '',
          data: {
            username: username // Store username in user metadata
          }
        }
      });

      if (error) {
        return { error, data: null };
      }

      if (data.user) {
        // Then claim the username
        const { data: claimData, error: claimError } = await supabase.rpc(
          'claim_username',
          { username_to_claim: username, user_uuid: data.user.id }
        );

        if (claimError || !claimData) {
          console.error('Error claiming username:', claimError);
          // If username claim fails, we should ideally delete the user account
          // but Supabase doesn't easily allow this, so we'll just return the error
          return { error: claimError || new Error('Failed to claim username'), data: null };
        }

        // Auto sign-in after successful registration by directly setting the session and user
        setSession(data.session);
        setUser(data.user);

        // Refresh the usernames list
        await fetchUsernames();
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error in signUp:', err);
      return { error: err, data: null };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { data, error };
    } catch (err) {
      console.error('Error in signIn:', err);
      return { error: err, data: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        availableUsernames,
        fetchUsernames,
        selectedUsername,
        setSelectedUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 