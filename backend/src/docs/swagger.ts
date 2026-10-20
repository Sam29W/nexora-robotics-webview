export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'NEXORA Robotics REST API',
    version: '1.0.0',
    description:
      'Shared Production Backend API for NEXORA Robotics Web, Mobile WebView, and PostgreSQL Synchronization',
  },
  servers: [
    {
      url: '/api',
      description: 'Current Environment API Base',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide Supabase Auth access_token received upon login',
      },
    },
    schemas: {
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          display_name: { type: 'string' },
          avatar_url: { type: 'string' },
          bio: { type: 'string' },
          gender: { type: 'string', enum: ['male', 'female', 'non-binary', 'other', 'unspecified'] },
          hobbies: { type: 'array', items: { type: 'string' } },
          strengths: { type: 'array', items: { type: 'string' } },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'System health check',
        responses: {
          '200': {
            description: 'API is running and healthy',
          },
        },
      },
    },
    '/v1/profile/me': {
      get: {
        summary: 'Get current user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Profile' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update current user profile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  display_name: { type: 'string', example: 'Alex Vance' },
                  bio: { type: 'string', example: 'Robotics engineer specializing in autonomous mobility.' },
                  avatar_url: { type: 'string', example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
                  gender: { type: 'string', enum: ['male', 'female', 'non-binary', 'other', 'unspecified'] },
                  hobbies: { type: 'array', items: { type: 'string' }, example: ['Drones', 'AI', 'Coding'] },
                  strengths: { type: 'array', items: { type: 'string' }, example: ['Agile Leadership', 'Debugging'] },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profile updated successfully',
          },
          '400': {
            description: 'Invalid input validation error',
          },
          '401': {
            description: 'Unauthorized access',
          },
        },
      },
    },
    '/v1/profile/me/audit-logs': {
      get: {
        summary: 'Retrieve database trigger audit history for current user',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Audit history retrieved successfully',
          },
          '401': {
            description: 'Unauthorized access',
          },
        },
      },
    },
  },
};
