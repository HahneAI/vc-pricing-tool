import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface BetaUser {
  id: string;
  email?: string;
  first_name: string;
  full_name?: string;
  job_title: string;
  tech_uuid: string;
  beta_code_used: string;
  beta_code_id: number;
  is_active: boolean;
  is_admin: boolean; // 🎯 NEW: Admin field
  created_at: string;
}

interface AuthContextType {
  user: BetaUser | null;
  loading: boolean;
  isAdmin: boolean; // 🎯 NEW: Admin status
  validateBetaCode: (code: string) => Promise<{ valid: boolean; error?: string }>;
  registerBetaUser: (userData: {
    firstName: string;
    jobTitle: string;
    email: string;
  }, betaCode: string, betaCodeId: number) => Promise<{ success: boolean; error?: string; userData?: any }>;
  signInBetaUser: (firstName: string, betaCodeId: string) => Promise<{ success: boolean; error?: string }>;
  completeRegistration: (userData: any) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('🟢 AUTH_CONTEXT - Provider mounting...');
  const [user, setUser] = useState<BetaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // 🎯 NEW: Admin state
  const initialized = useRef(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Initialize auth state
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = () => {
      // Check for existing session in localStorage
      const storedUser = localStorage.getItem('tradesphere_beta_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAdmin(userData.is_admin || false); // 🎯 NEW: Set admin status
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('tradesphere_beta_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const validateBetaCode = async (code: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/beta_codes?code=eq.${code}`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { valid: false, error: 'Failed to validate code' };
      }

      const codes = await response.json();
      const betaCode = codes.find((c: any) => c.code === code && c.is_active);
      
      return { 
        valid: !!betaCode, 
        error: betaCode ? undefined : 'Invalid or inactive beta code' 
      };
    } catch (error) {
      console.error('Beta code validation error:', error);
      return { valid: false, error: 'Validation failed' };
    }
  };

  const registerBetaUser = async (
    userData: { firstName: string; jobTitle: string; email: string }, 
    betaCode: string, 
    betaCodeId: number
  ): Promise<{ success: boolean; error?: string; userData?: any }> => {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/beta_users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: userData.firstName,
          job_title: userData.jobTitle,
          email: userData.email,
          tech_uuid: `tech_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          beta_code_used: betaCode,
          beta_code_id: betaCodeId,
          is_active: true,
          is_admin: false // 🎯 NEW: Default not admin
        })
      });

      if (!response.ok) {
        return { success: false, error: 'Registration failed' };
      }

      const newUser = await response.json();
      return { success: true, userData: newUser[0] };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const signInBetaUser = async (firstName: string, betaCodeId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Find user by first name (case-insensitive) and beta code id
      const response = await fetch(`${supabaseUrl}/rest/v1/beta_users?first_name=ilike.${firstName}&beta_code_id=eq.${betaCodeId}`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: 'Login failed' };
      }

      const users = await response.json();
      
      if (users.length === 0) {
        return { success: false, error: 'Invalid username or password' };
      }

      const userAccount = users[0];

      // Check if account is active
      if (!userAccount.is_active) {
        return { success: false, error: 'Account is deactivated' };
      }

      const betaUser = userAccount as BetaUser;

      // 🎯 NEW: Set admin status
      setUser(betaUser);
      setIsAdmin(betaUser.is_admin || false);
      localStorage.setItem('tradesphere_beta_user', JSON.stringify(betaUser));

      // 🎯 NEW: Log admin login
      if (betaUser.is_admin) {
        console.log('👑 ADMIN LOGIN DETECTED:', betaUser.first_name);
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const signOut = () => {
    setUser(null);
    setIsAdmin(false); // 🎯 NEW: Reset admin status
    localStorage.removeItem('tradesphere_beta_user');
  };

  const completeRegistration = (userData: BetaUser) => {
    setUser(userData);
    setIsAdmin(userData.is_admin || false); // 🎯 NEW: Set admin status
    localStorage.setItem('tradesphere_beta_user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAdmin, // 🎯 NEW: Expose admin status
    validateBetaCode,
    registerBetaUser,
    signInBetaUser,
    completeRegistration,
    signOut
  };

  return <AuthContext.Provider value={value}>
    {console.log('🎨 AUTH_CONTEXT - Providing:', { loading, user: !!user, isAdmin })}
    {children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};