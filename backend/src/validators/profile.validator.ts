import { z } from 'zod';

export const updateProfileSchema = z.object({
  display_name: z.string().trim().min(1, 'Display name cannot be empty').max(100, 'Display name too long').optional(),
  avatar_url: z.string().trim().max(1000).optional(),
  bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'other', 'unspecified']).optional(),
  hobbies: z.union([
    z.array(z.string().trim().min(1)),
    z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean)),
  ]).optional(),
  strengths: z.union([
    z.array(z.string().trim().min(1)),
    z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean)),
  ]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
