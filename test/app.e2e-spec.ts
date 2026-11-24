import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { OpenAPIObject } from '@nestjs/swagger';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/commons/configure-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import {
  UserPageResponseSchema,
  UserResponseSchema,
} from '../src/user/dto/user.dto.js';

void describe('Nest starter (e2e)', () => {
  let app: INestApplication<Parameters<typeof request>[0]>;
  let prisma: PrismaService;
  const testUserIds: number[] = [];

  before(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    prisma = app.get(PrismaService);
    await configureApp(app);
    await app.init();
  });

  after(async () => {
    try {
      if (testUserIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: testUserIds } } });
      }
    } finally {
      await app?.close();
    }
  });

  void it('serves the existing hello endpoint', async () => {
    await request(app.getHttpServer())
      .get('/api?name=world')
      .expect(200, { code: 200, msg: 'success', data: 'hello world' });
  });

  void it('validates, creates, reads, updates, and deletes a MySQL user', async () => {
    const api = request(app.getHttpServer());
    await api.post('/api/user').send({ name: '  ', age: 27 }).expect(400);
    await api
      .post('/api/user')
      .send({ name: 'Example', age: 27, id: 1 })
      .expect(400);
    await api.get('/api/user?pageSize=0').expect(400);
    for (const query of [
      'page=0',
      'page=-1',
      'page=1.5',
      'page=invalid',
      'pageSize=101',
      'pageSize=1.5',
      'pageSize=invalid',
      'offset=0&limit=1',
    ]) {
      await api.get(`/api/user?${query}`).expect(400);
    }
    await api.get('/api/user/invalid').expect(400);

    const created = await api
      .post('/api/user')
      .send({ name: '  Example  ', age: 27 })
      .expect(201);
    const { data: user } = UserResponseSchema.parse(created.body);
    testUserIds.push(user.id);
    assert.equal(user.name, 'Example');

    const path = `/api/user/${user.id}`;
    await api.get(path).expect(200, { code: 200, msg: 'success', data: user });
    const page = await api.get('/api/user/all?pageSize=1&page=1').expect(200);
    const {
      data: { list, total },
    } = UserPageResponseSchema.parse(page.body);
    assert.equal(list.length, 1);
    assert.ok(total >= list.length);

    await api.patch(path).send({}).expect(400);
    const updated = await api.patch(path).send({ age: 28 }).expect(200);
    assert.equal(UserResponseSchema.parse(updated.body).data.age, 28);
    await api.delete(path).expect(204);
    await api
      .get(path)
      .expect(404, { code: 404, msg: '用户不存在', data: null });
    await api.patch(path).send({ age: 29 }).expect(404);
    await api.delete(path).expect(404);
  });

  void it('applies pagination defaults and converts page numbers into offsets', async () => {
    const api = request(app.getHttpServer());
    for (const name of ['Pagination A', 'Pagination B']) {
      const created = await api
        .post('/api/user')
        .send({ name, age: 27 })
        .expect(201);
      testUserIds.push(UserResponseSchema.parse(created.body).data.id);
    }

    const defaults = await api.get('/api/user').expect(200);
    const explicit = await api.get('/api/user?page=1&pageSize=20').expect(200);
    assert.deepEqual(defaults.body, explicit.body);

    const firstTwo = UserPageResponseSchema.parse(
      (await api.get('/api/user?page=1&pageSize=2').expect(200)).body,
    ).data;
    const second = UserPageResponseSchema.parse(
      (await api.get('/api/user/all?page=2&pageSize=1').expect(200)).body,
    ).data;
    assert.equal(firstTwo.list.length, 2);
    assert.deepEqual(second.list, [firstTwo.list[1]]);
    assert.equal(second.total, firstTwo.total);
  });

  void it('derives request and response documentation from the Zod schemas', async () => {
    const result = await request(app.getHttpServer())
      .get('/swagger-json')
      .expect(200);
    const document = result.body as OpenAPIObject;
    // Assert schema semantics regardless of whether they are inline or referenced.
    const paths = JSON.parse(
      JSON.stringify(document.paths, (_key, value: unknown) => {
        if (value && typeof value === 'object' && '$ref' in value) {
          const ref = String(value.$ref);
          const prefix = '#/components/schemas/';
          if (ref.startsWith(prefix)) {
            return document.components?.schemas?.[ref.slice(prefix.length)];
          }
        }
        return value;
      }),
    ) as OpenAPIObject['paths'];
    assert.partialDeepStrictEqual(paths, {
      '/api': {
        get: { parameters: [{ name: 'name', required: false, in: 'query' }] },
      },
      '/api/user': {
        post: {
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  required: ['name', 'age'],
                  properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    age: { type: 'integer', minimum: 1 },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              content: {
                'application/json': {
                  schema: {
                    properties: {
                      data: {
                        properties: {
                          id: { type: 'integer' },
                          createdAt: { format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          parameters: [
            {
              name: 'page',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'pageSize',
              required: false,
              schema: { type: 'integer', maximum: 100, default: 20 },
            },
          ],
        },
      },
      '/api/user/{id}': {
        patch: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer', minimum: 1 },
            },
          ],
          requestBody: {
            content: { 'application/json': { schema: { minProperties: 1 } } },
          },
        },
      },
    });
  });
});
