/**
 * API Configuration
 * Base configuration for JioSaavn API integration
 */

export const API_CONFIG = {
  BASE_URL: 'https://saavn.sumit.co',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;
