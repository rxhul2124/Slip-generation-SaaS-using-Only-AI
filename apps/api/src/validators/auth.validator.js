import { z } from "zod";

const password = z.string().min(10).max(128);

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    password,
    companyName: z.string().min(2).max(160),
    rememberMe: z.boolean().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    rememberMe: z.boolean().optional()
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(20),
    password
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(20)
  })
});
