/* eslint-disable */
export interface LandscapeConfig {
  specialization: 'hardscaping' | 'softscaping' | 'full_service' | 'maintenance' | 'design';
  primaryServices: string[];
  seasonalThemes: boolean;
  region: 'northeast' | 'southeast' | 'midwest' | 'southwest' | 'northwest';
  brandVoice: 'professional' | 'friendly' | 'premium' | 'family_owned';
  visualEffects: {
    loadingAnimation: string;
    sendEffect: string;
    backgroundPattern: string;
    messageStyle: string;
  }
}

// More utility functions to be added here later.
