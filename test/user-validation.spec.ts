import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { configureApp } from "../src/commons/configure-app.js";
import { CreateUserSchema } from "../src/user/dto/create-user.dto.js";
import { UpdateUserSchema } from "../src/user/dto/update-user.dto.js";
import { UserController } from "../src/user/user.controller.js";
import { UserService } from "../src/user/user.service.js";

import type { INestApplication } from "@nestjs/common";

void describe("User validation messages", () => {
  let app: INestApplication<Parameters<typeof request>[0]>;

  before(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: {} },
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => ({ prefix: "api" }) },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    await configureApp(app);
    await app.init();
  });

  after(async () => {
    await app?.close();
  });

  const cases = [
    { body: {}, message: "姓名不能为空" },
    { body: { age: 18 }, message: "姓名不能为空" },
    { body: { name: null, age: 18 }, message: "姓名不能为空" },
    { body: { name: "", age: 18 }, message: "姓名不能为空" },
    { body: { name: "   ", age: 18 }, message: "姓名不能为空" },
    { body: { name: "张三" }, message: "年龄不能为空" },
    { body: { name: "张三", age: null }, message: "年龄不能为空" },
    { body: { name: "张三", age: 0 }, message: "年龄不能小于1" },
    { body: { name: "张三", age: -1 }, message: "年龄不能小于1" },
    { body: { name: 123, age: 18 }, message: "姓名必须是字符串" },
    { body: { name: "张三", age: "18" }, message: "年龄必须是32位整数" },
    { body: { name: "张三", age: 1.5 }, message: "年龄必须是32位整数" },
  ];

  for (const { body, message } of cases) {
    void it(`returns ${message} for ${JSON.stringify(body)}`, async () => {
      await request(app.getHttpServer())
        .post("/api/user/create")
        .send(body)
        .expect(400, { code: 400, msg: message, data: null });
    });
  }

  void it("accepts the minimum age and trims names", () => {
    assert.deepEqual(CreateUserSchema.parse({ name: " 张三 ", age: 1 }), {
      name: "张三",
      age: 1,
    });
  });

  void it("keeps update fields optional and reuses validation messages", async () => {
    assert.deepEqual(UpdateUserSchema.parse({ name: "张三" }), {
      name: "张三",
    });
    assert.deepEqual(UpdateUserSchema.parse({ age: 1 }), { age: 1 });
    await request(app.getHttpServer())
      .patch("/api/user/1")
      .send({ age: 0 })
      .expect(400, { code: 400, msg: "年龄不能小于1", data: null });
  });
});
