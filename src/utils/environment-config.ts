interface EnvironmentConfig {
  companyName: string;
  primaryColor: string;
  logoUrl: string;
  welcomeMessage: string;
  industry: string;
  makeWebhookUrl: string | null;
  netlifyApiUrl: string | null;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Vite provides env variables through import.meta.env
const env = import.meta.env;

function getEnvVariable(key: string, defaultValue?: string): string {
  const value = env[key];
  if (value) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Missing required environment variable: ${key}`);
}

function getOptionalEnvVariable(key: string): string | null {
    return env[key] || null;
}


export const config: EnvironmentConfig = {
  companyName: getEnvVariable('VITE_COMPANY_NAME', 'TradeSphere'),
  primaryColor: getEnvVariable('VITE_PRIMARY_COLOR', '#2563eb'),
  logoUrl: getEnvVariable('VITE_LOGO_URL', '/assets/branding/default-logo.svg'),
  welcomeMessage: getEnvVariable('VITE_WELCOME_MESSAGE', "Let's make some profit. What are we doing today?"),
  industry: getEnvVariable('VITE_INDUSTRY', 'general_trades'),
  makeWebhookUrl: getOptionalEnvVariable('VITE_MAKE_WEBHOOK_URL'),
  netlifyApiUrl: getOptionalEnvVariable('VITE_NETLIFY_API_URL'),
  supabaseUrl: getEnvVariable('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnvVariable('VITE_SUPABASE_ANON_KEY'),
};

// Runtime validation
if (!config.supabaseUrl || !config.supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is not configured. Please check your .env file.");
    // In a real app, you might want to show a more user-friendly error message.
}

// Log a warning if the webhook URL is not set in production
if (import.meta.env.PROD && !config.makeWebhookUrl) {
    console.warn("VITE_MAKE_WEBHOOK_URL is not set. Some features might not be available.");
}
