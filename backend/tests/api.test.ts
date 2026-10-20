import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { updateProfileSchema } from '../src/validators/profile.validator';

describe('Health Check API', () => {
  it('GET /api/health should return 200 OK with healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'nexora-backend');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET / non-existent route should return 404', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toContain('Endpoint not found');
  });
});

describe('Authentication Middleware & Security', () => {
  it('GET /api/v1/profile/me should reject requests without Authorization header with 401', async () => {
    const res = await request(app).get('/api/v1/profile/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toMatch(/Missing or malformed Authorization header/i);
  });

  it('GET /api/v1/profile/me should reject non-Bearer tokens with 401', async () => {
    const res = await request(app)
      .get('/api/v1/profile/me')
      .set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  it('PATCH /api/v1/profile/me should reject unauthenticated update requests with 401', async () => {
    const res = await request(app)
      .patch('/api/v1/profile/me')
      .send({ display_name: 'Hacker' });
    expect(res.status).toBe(401);
  });
});

describe('Zod Input Validation', () => {
  it('should validate valid profile update payload', () => {
    const validData = {
      display_name: 'Dr. Jane Robotics',
      bio: 'Leading autonomous systems researcher.',
      gender: 'female',
      hobbies: ['AI', 'Robotics', 'Chess'],
      strengths: ['Algorithms', 'System Design'],
    };

    const result = updateProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should convert comma-separated string hobbies into array', () => {
    const dataWithCommaString = {
      display_name: 'Alex Vance',
      hobbies: 'Robotics, Electronics, Cybernetics',
    };

    const result = updateProfileSchema.safeParse(dataWithCommaString);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hobbies).toEqual(['Robotics', 'Electronics', 'Cybernetics']);
    }
  });

  it('should reject invalid gender enumeration', () => {
    const invalidData = {
      gender: 'alien',
    };

    const result = updateProfileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty display name if provided', () => {
    const invalidData = {
      display_name: '   ',
    };

    const result = updateProfileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
