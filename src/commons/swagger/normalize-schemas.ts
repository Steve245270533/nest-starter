import type {
  OpenAPIObject,
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger';

/** Knife4j expects JSON objects (including nested objects) to be named models. */
export function normalizeSchemas(document: OpenAPIObject): OpenAPIObject {
  const components = (document.components ??= {});
  const models = (components.schemas ??= {});

  function normalize(
    schema: SchemaObject | ReferenceObject,
    name: string,
    extract = true,
  ): SchemaObject | ReferenceObject {
    if ('$ref' in schema) return schema;

    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        schema.properties[key] = normalize(value, `${name}_${key}`);
      }
    }
    if (schema.items) {
      schema.items = normalize(schema.items, `${name}_Item`);
    }
    if (typeof schema.additionalProperties === 'object') {
      schema.additionalProperties = normalize(
        schema.additionalProperties,
        `${name}_Value`,
      );
    }
    for (const key of ['allOf', 'oneOf', 'anyOf'] as const) {
      if (schema[key]) {
        schema[key] = schema[key].map((item, index) =>
          normalize(item, `${name}_${key}_${index}`),
        );
      }
    }
    if (schema.not) schema.not = normalize(schema.not, `${name}_Not`);

    if (!extract || !schema.properties) return schema;

    const base = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    let modelName = base;
    for (let suffix = 2; Object.hasOwn(models, modelName); suffix++) {
      modelName = `${base}_${suffix}`;
    }
    models[modelName] = schema;
    return { $ref: `#/components/schemas/${modelName}` };
  }

  // Keep existing model names and references; normalize their nested objects too.
  for (const [name, schema] of Object.entries(models)) {
    normalize(schema, name, false);
  }

  for (const [path, item] of Object.entries(document.paths)) {
    for (const method of [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'options',
      'head',
      'trace',
    ] as const) {
      const operation = item[method];
      if (!operation) continue;
      const name = operation.operationId ?? `${method}_${path}`;
      const body = operation.requestBody;
      if (body && !('$ref' in body)) {
        for (const [mediaType, media] of Object.entries(body.content)) {
          // Inline form properties carry field/upload semantics in Knife4j.
          if (mediaType === 'application/json' && media.schema) {
            media.schema = normalize(media.schema, `${name}_Request`);
          }
        }
      }
      for (const [status, response] of Object.entries(operation.responses)) {
        if (!response || '$ref' in response) continue;
        for (const media of Object.values(response.content ?? {})) {
          if (media.schema) {
            media.schema = normalize(
              media.schema,
              `${name}_Response_${status}`,
            );
          }
        }
      }
    }
  }
  return document;
}
