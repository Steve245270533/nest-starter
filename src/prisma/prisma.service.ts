import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "../../prisma/generated/client.js";

import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaMariaDb(config.getOrThrow<string>("DATABASE_URL")),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
