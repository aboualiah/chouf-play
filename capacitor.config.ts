import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.66c8ec265f5c4e8e98ca9d99bab43c81',
  appName: 'chouf-play',
  webDir: 'dist',
  server: {
    url: 'https://66c8ec26-5f5c-4e8e-98ca-9d99bab43c81.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    // Disable Capacitor's default back handler so we control it entirely
    backButtonHandler: false,
  },
};

export default config;
