/**
 * API Configuration
 *
 * Matches backend/lib/env_checker.rb logic:
 * 1. Production: PUBLIC_HOST -> https://PUBLIC_HOST
 * 2. Cloud dev: APP_PORT + CLACKY_PREVIEW_DOMAIN_BASE -> https://3001.dev.clacky.com
 * 3. Local dev: http://localhost:3001
 *
 * Environment variables are mapped through app.config.js to support
 * both system-injected vars (APP_PORT) and Expo format (EXPO_PUBLIC_APP_PORT)
 */

import Constants from 'expo-constants';

const getApiBaseUrl = (): string => {
  const extra = Constants.expoConfig?.extra || {};

  // 1. Production: Use PUBLIC_HOST if set
  if (extra.PUBLIC_HOST) {
    return `https://${extra.PUBLIC_HOST}`;
  }

  // 2. Cloud dev: Use APP_PORT + CLACKY_PREVIEW_DOMAIN_BASE
  if (extra.CLACKY_PREVIEW_DOMAIN_BASE) {
    const port = extra.APP_PORT || '3001';
    const domainBase = extra.CLACKY_PREVIEW_DOMAIN_BASE;
    return `https://${port}${domainBase}`;
  }

  // 3. Local dev: fallback to localhost
  const defaultPort = extra.APP_PORT || '3001';
  return `http://localhost:${defaultPort}`;
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/v1/health`,
};
