import assert from 'node:assert/strict';
import { it } from 'node:test';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { OpenAPIObject } from '@nestjs/swagger';
import request from 'supertest';
import { z } from 'zod';
import { normalizeSchemas } from '../src/commons/swagger/normalize-schemas.js';
import { setupSwagger } from '../src/commons/swagger/setupSwagger.js';
import { UserController } from '../src/user/user.controller.js';
import { UserService } from '../src/user/user.service.js';

void it('uses business model names and reuses user models across endpoints', async () => {
  const module = await Test.createTestingModule({
    controllers: [UserController],
    providers: [{ provide: UserService, useValue: {} }],
  }).compile();
  const app: INestApplication<Parameters<typeof request>[0]> =
    module.createNestApplication();
  try {
    app.setGlobalPrefix('api');
    await setupSwagger(app);
    await app.init();
    const result = await request(app.getHttpServer())
      .get('/swagger-json')
      .expect(200);
    const document = z
      .object({
        components: z.object({ schemas: z.record(z.string(), z.unknown()) }),
        paths: z.record(z.string(), z.unknown()),
      })
      .parse(result.body);
    assert.deepEqual(Object.keys(document.components.schemas).sort(), [
      'CreateUserRequest',
      'UpdateUserRequest',
      'User',
      'UserPage',
      'UserPageResponse',
      'UserResponse',
    ]);
    assert.partialDeepStrictEqual(document.components.schemas, {
      UserResponse: {
        properties: { data: { $ref: '#/components/schemas/User' } },
      },
      UserPage: {
        properties: {
          list: { items: { $ref: '#/components/schemas/User' } },
        },
      },
      UpdateUserRequest: { minProperties: 1 },
    });
    assert.partialDeepStrictEqual(document.paths, {
      '/api/user/create': {
        post: {
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUserRequest' },
              },
            },
          },
          responses: {
            '201': {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserResponse' },
                },
              },
            },
          },
        },
      },
    });
  } finally {
    await app.close();
  }
});

void it('keeps distinct schemas with the same title and preserves existing models', () => {
  const document: OpenAPIObject = {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1' },
    components: {
      schemas: { Model: { type: 'string' } },
    },
    paths: {
      '/test': {
        post: {
          responses: {
            '200': {
              description: '',
              content: {
                'application/json': {
                  schema: {
                    title: 'Model',
                    type: 'object',
                    properties: { value: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  normalizeSchemas(document);
  assert.partialDeepStrictEqual(document, {
    components: {
      schemas: {
        Model: { type: 'string' },
        Model_2: { title: 'Model', properties: { value: { type: 'string' } } },
      },
    },
    paths: {
      '/test': {
        post: {
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Model_2' },
                },
              },
            },
          },
        },
      },
    },
  });
  const once = structuredClone(document);
  normalizeSchemas(document);
  assert.deepEqual(document, once);
});
