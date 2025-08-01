interface ParsedButtonTexts {
  send: string;
  clear: string;
  export: string;
}

interface ParsedStatusMessages {
  thinking: string;
  processing: string;
  complete: string;
}
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

  // Landscaping Specific
  industrySpecialization: string;
  industryVoice: string;
  seasonalThemes: boolean;
  region: string;
  climateZone: string;
  visualEffects: string;
  headerIcon: string;
  sendEffect: string;
  loadingAnimation: string;
  serviceTerminology: string;
  projectTerms: string;
  estimateLanguage: string;
  completionTerms: string;
  welcomeVariants: string[];
  placeholderExamples: string;
  buttonTexts: ParsedButtonTexts;
  statusMessages: ParsedStatusMessages;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  neutralColor: string;
  gradientStyle: string;
  sendIcon: string;
  loadingIcon: string;
  successIcon: string;
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

function parseKeyValue<T extends object>(str: string, defaults: T): T {
    if (!str) return defaults;
    try {
        return str.split('|').reduce((acc, curr) => {
            const [key, value] = curr.split(':');
            (acc as Record<string, string>)[key.trim()] = value.trim();
            return acc;
        }, {} as T);
    } catch (e) {
        console.error("Failed to parse key-value string:", e);
        return defaults;
    }
}


export const config: EnvironmentConfig = {
  // Original
  companyName: getEnvVariable('VITE_COMPANY_NAME', 'TradeSphere'),
  primaryColor: getEnvVariable('VITE_PRIMARY_COLOR', '#2563eb'),
  logoUrl: getEnvVariable('VITE_LOGO_URL', '/assets/branding/default-logo.svg'),
  welcomeMessage: getEnvVariable('VITE_WELCOME_MESSAGE', "Let's make some profit. What are we doing today?"),
  industry: getEnvVariable('VITE_INDUSTRY', 'general_trades'),
  makeWebhookUrl: getOptionalEnvVariable('VITE_MAKE_WEBHOOK_URL'),
  netlifyApiUrl: getOptionalEnvVariable('VITE_NETLIFY_API_URL'),
  supabaseUrl: getEnvVariable('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnvVariable('VITE_SUPABASE_ANON_KEY'),

  // Landscaping Specific (with fallbacks to sensible defaults)
  industrySpecialization: getEnvVariable('VITE_INDUSTRY_SPECIALIZATION', 'full_service'),
  industryVoice: getEnvVariable('VITE_INDUSTRY_VOICE', 'professional_approachable'),
  seasonalThemes: getEnvVariable('VITE_SEASONAL_THEMES', 'true') === 'true',
  region: getEnvVariable('VITE_REGION', 'southeast'),
  climateZone: getEnvVariable('VITE_CLIMATE_ZONE', '7a'),
  visualEffects: getEnvVariable('VITE_VISUAL_EFFECTS', 'subtle'),
  headerIcon: getEnvVariable('VITE_HEADER_ICON', 'MessageCircle'),
  sendEffect: getEnvVariable('VITE_SEND_EFFECT', 'leaf_flutter'),
  loadingAnimation: getEnvVariable('VITE_LOADING_ANIMATION', 'growth'),
  serviceTerminology: getEnvVariable('VITE_SERVICE_TERMINOLOGY', 'landscape_contractor'),
  projectTerms: getEnvVariable('VITE_PROJECT_TERMS', 'outdoor_living_spaces'),
  estimateLanguage: getEnvVariable('VITE_ESTIMATE_LANGUAGE', 'landscape_investment'),
  completionTerms: getEnvVariable('VITE_COMPLETION_TERMS', 'property_transformation'),
  welcomeVariants: getEnvVariable('VITE_WELCOME_VARIANTS', "Ready to transform your outdoor living space?|Let's design your dream landscape together.").split('|'),
  placeholderExamples: getEnvVariable('VITE_PLACEHOLDER_EXAMPLES', 'e.g., backyard patio installation, retaining wall design'),
  buttonTexts: parseKeyValue(getEnvVariable('VITE_BUTTON_TEXTS', ''), { send: 'Get My Landscape Estimate', clear: 'Start New Project Design', export: 'Download Landscape Proposal' }),
  statusMessages: parseKeyValue(getEnvVariable('VITE_STATUS_MESSAGES', ''), { thinking: 'Calculating your landscape investment...', processing: 'Designing your outdoor living solution...', complete: 'Your landscape transformation plan is ready!' }),
  secondaryColor: getEnvVariable('VITE_SECONDARY_COLOR', '#8b4513'),
  accentColor: getEnvVariable('VITE_ACCENT_COLOR', '#f4a460'),
  successColor: getEnvVariable('VITE_SUCCESS_COLOR', '#32cd32'),
  neutralColor: getEnvVariable('VITE_NEUTRAL_COLOR', '#696969'),
  gradientStyle: getEnvVariable('VITE_GRADIENT_STYLE', 'earth-to-growth'),
  sendIcon: getEnvVariable('VITE_SEND_ICON', 'Send'),
  loadingIcon: getEnvVariable('VITE_LOADING_ICON', 'Leaf'),
  successIcon: getEnvVariable('VITE_SUCCESS_ICON', 'CheckCircle2'),
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
