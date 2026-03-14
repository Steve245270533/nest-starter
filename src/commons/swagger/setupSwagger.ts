import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { knife4jSetup } from 'nestjs-knife4j-plus';

export async function setupSwagger(
  app: INestApplication,
  cleanupOpenApiDocFn?: (doc: OpenAPIObject) => OpenAPIObject,
) {
  const options = new DocumentBuilder()
    .setTitle('Nest接口文档')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup(
    'swagger',
    app,
    cleanupOpenApiDocFn ? cleanupOpenApiDocFn(document) : document,
  );

  await knife4jSetup(app, [
    {
      name: '1.0 version',
      url: 'swagger-json',
    },
  ]);
}
