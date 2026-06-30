<<<<<<< HEAD
import 'dotenv/config';

// Ek helper — agar required var missing hai to TURANT crash, undefined leak nahi
function required(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`❌ Missing required env variable: ${key}. Check your .env file.`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback;
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: Number(optional('PORT', '3000')),

  neo4j: {
    uri: required('NEO4J_URI'),
    user: required('NEO4J_USER'),
    password: required('NEO4J_PASSWORD'),
  },

  postgres: {
    url: required('DATABASE_URL'),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  ai: {
    groqApiKey: required('GROQ_API_KEY'),
  },
} as const;
=======
import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  NEO4J_URI: z.string().default('bolt://localhost:7687'),
  NEO4J_USER: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().default('password'),
  ANTHROPIC_API_KEY: z.string().default(''),
  RENDER_API_KEY: z.string().default(''),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
>>>>>>> upstream/main
