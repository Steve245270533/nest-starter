import assert from "node:assert/strict";
import { it } from "node:test";

import { Logger, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { z } from "zod";

import { AppController } from "../src/app.controller.js";
import { setupSwagger } from "../src/commons/swagger/setupSwagger.js";
import { UserController } from "../src/user/user.controller.js";
import { UserService } from "../src/user/user.service.js";

import type { INestApplication } from "@nestjs/common";

void it("uses business model names and reuses user models across endpoints", async () => {
  const module = await Test.createTestingModule({
    controllers: [AppController, UserController],
    providers: [
      Logger,
      { provide: ConfigService, useValue: {} },
      { provide: UserService, useValue: {} },
    ],
  }).compile();
  const app: INestApplication<Parameters<typeof request>[0]> =
    module.createNestApplication();
  try {
    app.setGlobalPrefix("api");
    app.enableVersioning({ type: VersioningType.URI });
    await setupSwagger(app);
    await app.init();
    const result = await request(app.getHttpServer())
      .get("/swagger-json")
      .expect(200);
    const document = z
      .object({
        components: z.object({ schemas: z.record(z.string(), z.unknown()) }),
        paths: z.record(z.string(), z.unknown()),
      })
      .parse(result.body);
    assert.deepEqual(Object.keys(document.components.schemas).sort(), [
      "CreateUserRequest",
      "HelloResponse",
      "UpdateUserRequest",
      "User",
      "UserPage",
      "UserPageResponse",
      "UserResponse",
    ]);
    assert.partialDeepStrictEqual(document.components.schemas, {
      UserResponse: {
        properties: { data: { $ref: "#/components/schemas/User" } },
      },
      UserPage: {
        properties: {
          list: { items: { $ref: "#/components/schemas/User" } },
        },
      },
      CreateUserRequest: { required: ["name", "age"] },
      UpdateUserRequest: { minProperties: 1 },
      HelloResponse: { properties: { data: { type: "string" } } },
    });
    assert.partialDeepStrictEqual(document.paths, {
      "/api": {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HelloResponse" },
                },
              },
            },
          },
        },
      },
      "/api/v2": {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": { schema: { type: "string" } },
              },
            },
          },
        },
      },
      "/api/user/create": {
        post: {
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateUserRequest" },
              },
            },
          },
          responses: {
            "201": {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserResponse" },
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
