import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface BetaUser {
  id: string;
  email: string;
  first_name: string;
  full_name: string;
  job_title: string;
  tech_uuid: string;
  beta_code_used: string;
  beta_code_id: number;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: BetaUser | null;
  loading: boolean;
  validateBetaCode: (code: string) => Promise<{ valid: boolean; error?: string }>;
  registerBetaUser: (userData: {
    email: string;
    firstName: string;
    fullName: string;
    jobTitle: string;
  }, betaCode: string, betaCodeId: number) => Promise<{ success: boolean; error?: string }>;
  signInBetaUser: (firstName: string, betaCodeId: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BetaUser | null>(null);
  const [loading, setLoading] = useState(true);
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
        return { valid: false, error: 'Failed to validate beta code' };
      }

      const codes = await response.json();
      
      if (codes.length === 0) {
        return { valid: false, error: 'Invalid beta code' };
      }

      const betaCode = codes[0];
      
      if (betaCode.used) {
        return { valid: false, error: 'Beta code already used' };
      }

      if (new Date(betaCode.expires_at) < new Date()) {
        return { valid: false, error: 'Beta code expired' };
      }

      return { valid: true };
    } catch (error) {
      console.error('Beta code validation error:', error);
      return { valid: false, error: 'Network error validating beta code' };
    }
  };

  const registerBetaUser = async (
    userData: {
      email: string;
      firstName: string;
      fullName: string;
      jobTitle: string;
    },
    betaCode: string,
    betaCodeId: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, validate the beta code again
      const codeValidation = await validateBetaCode(betaCode);
      if (!codeValidation.valid) {
        return { success: false, error: codeValidation.error };
      }

      // Create the user
      const createUserResponse = await fetch(`${supabaseUrl}/rest/v1/beta_users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.firstName,
          full_name: userData.fullName,
          job_title: userData.jobTitle,
          beta_code_used: betaCode,
          beta_code_id: betaCodeId
        })
      });

      if (!createUserResponse.ok) {
        const errorData = await createUserResponse.json();
        return { success: false, error: errorData.message || 'Failed to create user account' };
      }

      const newUser = (await createUserResponse.json())[0] as BetaUser;

      // Mark the beta code as used
      const updateCodeResponse = await fetch(`${supabaseUrl}/rest/v1/beta_codes?code=eq.${betaCode}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          used: true,
          used_by_email: userData.email,
          used_by_user_id: newUser.id,
          used_at: new Date().toISOString()
        })
      });

      if (!updateCodeResponse.ok) {
        console.error('Failed to mark beta code as used');
        // Don't fail the registration for this, but log it
      }

      // Set user in state and localStorage
      setUser(newUser);
      localStorage.setItem('tradesphere_beta_user', JSON.stringify(newUser));

      return { success: true };
    } catch (error) {
      console.error('User registration error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  };

  const signInBetaUser = async (firstName: string, betaCodeId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Find user by first name and beta code id
      const response = await fetch(`${supabaseUrl}/rest/v1/beta_users?first_name=eq.${firstName}&beta_code_id=eq.${betaCodeId}`, {
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

      // Set user in state and localStorage
      setUser(betaUser);
      localStorage.setItem('tradesphere_beta_user', JSON.stringify(betaUser));

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('tradesphere_beta_user');
  };

  const value = {
    user,
    loading,
    validateBetaCode,
    registerBetaUser,
    signInBetaUser,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};