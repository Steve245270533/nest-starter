import { after, before, describe, it } from "node:test";

import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { configureApp } from "../src/commons/configure-app.js";

import type { INestApplication } from "@nestjs/common";

@Controller("errors")
class ErrorController {
  @Get("database")
  database() {
    return Promise.reject(
      new Error("Can't reach database server: private connection details"),
    );
  }

  @Get("business")
  business() {
    throw new NotFoundException("用户不存在");
  }

  @Get("validation")
  validation() {
    throw new BadRequestException(["姓名不能为空", "年龄不能为空"]);
  }
}

void describe("HTTP exception responses", () => {
  let app: INestApplication<Parameters<typeof request>[0]>;

  before(async () => {
    const module = await Test.createTestingModule({
      controllers: [ErrorController],
      providers: [
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => ({ prefix: "api" }) },
        },
      ],
    }).compile();
    app = module.createNestApplication({ logger: false });
    await configureApp(app);
    await app.init();
  });

  after(async () => {
    await app?.close();
  });

  void it("formats unexpected async errors without exposing internal details", async () => {
    await request(app.getHttpServer()).get("/api/errors/database").expect(500, {
      code: 500,
      msg: "Internal server error",
      data: null,
    });
  });

  void it("preserves business exception statuses and messages", async () => {
    await request(app.getHttpServer()).get("/api/errors/business").expect(404, {
      code: 404,
      msg: "用户不存在",
      data: null,
    });
  });

  void it("returns the first validation message", async () => {
    await request(app.getHttpServer())
      .get("/api/errors/validation")
      .expect(400, {
        code: 400,
        msg: "姓名不能为空",
        data: null,
      });
  });
});
