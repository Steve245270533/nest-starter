import config from "config";
import { z } from "zod";

const AppConfigSchema = z.object({
  name: z.string(),
  logger: z.boolean(),
  cors: z.boolean(),
  prefix: z.string(),
  version: z.array(z.string()).optional(),
});

export interface Configuration {
  app: z.infer<typeof AppConfigSchema>;
}

export default function configuration(): Configuration {
  return { app: AppConfigSchema.parse(config.get("app")) };
}
