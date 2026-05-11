/**
 * API Configuration
 * Base configuration for JioSaavn API integration
 */

export const API_CONFIG = {
  BASE_URL: 'https://jiosaavn-api1.sammyzf8857.workers.dev',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;
