import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Event Analytics API',
        version: '1.0.0',
        description: 'Backend API for event ingestion & analytics',
      },
      servers: [
        {
          url: 'http://localhost:5000/api',
        },
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
      security: [{ ApiKeyAuth: [] }],
    },
    apis: [
      './src/docs/event.documentation.ts',
      './src/routes/*.ts',
    ],
  };

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
  