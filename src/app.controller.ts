import { Controller, Get, Logger, Query, Version } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOkResponse } from "@nestjs/swagger";
import { z } from "zod";

import { responseSchema } from "./commons/dto/index.js";
import { Result } from "./commons/utils/result.js";

import type { Configuration } from "./commons/config/configuration.js";

const HelloQuerySchema = z.object({
  name: z.string().describe("用户名称").optional(),
});
const HelloResponseSchema = responseSchema(z.string()).meta({
  id: "HelloResponse",
});

@Controller()
export class AppController {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService<Configuration>,
  ) {}

  @Get()
  @ApiOkResponse({ standardSchema: HelloResponseSchema })
  getHello(
    @Query({ schema: HelloQuerySchema })
    { name }: z.infer<typeof HelloQuerySchema>,
  ) {
    this.logger.log(
      `appName: ${this.configService.get("app", { infer: true })?.name}, name: ${name}`,
      AppController.name,
    );
    return Result.ok(`hello ${name}`);
  }

  @Get()
  @Version("2")
  @ApiOkResponse({ standardSchema: z.string() })
  getHelloV2() {
    return "hello-v2";
  }
}
