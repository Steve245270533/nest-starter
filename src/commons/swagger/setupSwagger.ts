import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { knife4jSetup } from 'nestjs-knife4j-plus';

export async function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Nest Starter API')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('swagger', app, () =>
    SwaggerModule.createDocument(app, options),
  );

  await knife4jSetup(app, [{ name: 'Nest Starter API', url: '/swagger-json' }]);
}
