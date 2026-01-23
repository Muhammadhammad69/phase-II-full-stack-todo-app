import { betterAuth } from 'better-auth';

// Initialize Better-Auth with configuration
export const auth = betterAuth({
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL!,
  },
  socialProviders: {},
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  },
});