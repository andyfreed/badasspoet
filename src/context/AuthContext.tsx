'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  availableUsernames: { id: number; username: string; is_taken: boolean; user_id?: string | null; is_admin?: boolean }[];
  fetchUsernames: () => Promise<void>;
  selectedUsername: string | null;
  setSelectedUsername: (username: string | null) => void;
  makeUserAdmin: (targetUserId: string) => Promise<boolean>;
  removeUserAdmin: (targetUserId: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [availableUsernames, setAvailableUsernames] = useState<
    { id: number; username: string; is_taken: boolean; user_id?: string | null; is_admin?: boolean }[]
  >([]);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  // Check if current user is admin
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('is_user_admin', { user_uuid: userId });
      if (!error && data !== null && data !== undefined) {
        setIsAdmin(data);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Admin check failed:', error);
        }
        setIsAdmin(false);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking admin status:', err);
      }
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Setup auth state listener
    const setupAuthListener = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      
      // Check admin status if user exists
      if (data.session?.user) {
        await checkAdminStatus(data.session.user.id);
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Auth event: ${event}`);
          }
          setSession(session);
          setUser(session?.user || null);
          
          // Check admin status on auth state change
          if (session?.user) {
            await checkAdminStatus(session.user.id);
          } else {
            setIsAdmin(false);
          }
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
        .select('*');

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching usernames:', error);
        }
        return;
      }

      // Sort the data manually if needed
      const sortedData = data ? [...data].sort((a, b) => a.username.localeCompare(b.username)) : [];
      setAvailableUsernames(sortedData);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in fetchUsernames:', err);
      }
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
          emailRedirectTo: window.location.origin,
          data: {
            username: username // Store username in user metadata
          }
        }
      });

      if (error) {
        return { error, data: null };
      }

      if (data.user) {
        // If email confirmation is required, we need to handle it differently
        if (data.user.identities && data.user.identities.length === 0) {
          // User needs to confirm email
          return { 
            error: new Error('Please check your email to confirm your account. After confirming, you can sign in.'), 
            data: null 
          };
        }

        // Small delay to ensure user is properly created in the database
        await new Promise(resolve => setTimeout(resolve, 500));

        // Then claim the username
        const { data: claimData, error: claimError } = await supabase.rpc(
          'claim_username',
          { username_to_claim: username, user_uuid: data.user.id }
        );

        if (claimError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error claiming username:', claimError);
          }
          // Try to sign the user in anyway if username claim fails
          if (data.session) {
            setSession(data.session);
            setUser(data.user);
            await fetchUsernames();
            return { 
              error: new Error('Account created but username claim failed. You can still sign in.'), 
              data 
            };
          }
          return { error: claimError, data: null };
        }

        // Auto sign-in after successful registration
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
        }

        // Refresh the usernames list
        await fetchUsernames();
      }

      return { data, error: null };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in signUp:', err);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in signIn:', err);
      }
      return { error: err, data: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error signing out:', err);
      }
    }
  };

  // Make user admin
  const makeUserAdmin = async (targetUserId: string) => {
    try {
      if (!user) return false;
      const { data, error } = await supabase.rpc('make_user_admin', { 
        target_user_id: targetUserId,
        requesting_user_id: user.id
      });
      if (!error && data) {
        await fetchUsernames(); // Refresh the usernames list
      }
      return !!data;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error making user admin:', err);
      }
      return false;
    }
  };

  // Remove user admin
  const removeUserAdmin = async (targetUserId: string) => {
    try {
      if (!user) return false;
      const { data, error } = await supabase.rpc('remove_user_admin', { 
        target_user_id: targetUserId,
        requesting_user_id: user.id
      });
      if (!error && data) {
        await fetchUsernames(); // Refresh the usernames list
      }
      return !!data;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing user admin:', err);
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        availableUsernames,
        fetchUsernames,
        selectedUsername,
        setSelectedUsername,
        makeUserAdmin,
        removeUserAdmin,
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