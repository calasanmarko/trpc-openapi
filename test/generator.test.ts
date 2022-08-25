import * as trpc from '@trpc/server';
import { Subscription } from '@trpc/server';
import openAPISchemaValidator from 'openapi-schema-validator';
import { z } from 'zod';

import { OpenApiMeta, generateOpenApiDocument, openApiVersion } from '../src';

// TODO: test for duplicate paths (using getPathRegExp)

const openApiSchemaValidator = new openAPISchemaValidator({ version: openApiVersion });

describe('generator', () => {
  test('open api version', () => {
    expect(openApiVersion).toBe('3.0.3');
  });

  test('with empty router', () => {
    const appRouter = trpc.router<any, OpenApiMeta>();

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      description: 'API documentation',
      baseUrl: 'http://localhost:3000/api',
      docsUrl: 'http://localhost:3000/docs',
      tags: [],
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument).toMatchInlineSnapshot(`
      Object {
        "components": Object {
          "responses": Object {
            "error": Object {
              "content": Object {
                "application/json": Object {
                  "schema": Object {
                    "additionalProperties": false,
                    "properties": Object {
                      "code": Object {
                        "type": "string",
                      },
                      "issues": Object {
                        "items": Object {
                          "additionalProperties": false,
                          "properties": Object {
                            "message": Object {
                              "type": "string",
                            },
                          },
                          "required": Array [
                            "message",
                          ],
                          "type": "object",
                        },
                        "type": "array",
                      },
                      "message": Object {
                        "type": "string",
                      },
                    },
                    "required": Array [
                      "message",
                      "code",
                    ],
                    "type": "object",
                  },
                },
              },
              "description": "Error response",
            },
          },
          "securitySchemes": Object {
            "Authorization": Object {
              "scheme": "bearer",
              "type": "http",
            },
          },
        },
        "externalDocs": Object {
          "url": "http://localhost:3000/docs",
        },
        "info": Object {
          "description": "API documentation",
          "title": "tRPC OpenAPI",
          "version": "1.0.0",
        },
        "openapi": "3.0.3",
        "paths": Object {},
        "servers": Array [
          Object {
            "url": "http://localhost:3000/api",
          },
        ],
        "tags": Array [],
      }
    `);
  });

  test('with missing input', () => {
    {
      const appRouter = trpc.router<any, OpenApiMeta>().query('noInput', {
        meta: { openapi: { path: '/no-input', method: 'GET' } },
        output: z.object({ name: z.string() }),
        resolve: () => ({ name: 'jlalmes' }),
      });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[query.noInput] - Input parser expects a Zod validator');
    }
    {
      const appRouter = trpc.router<any, OpenApiMeta>().mutation('noInput', {
        meta: { openapi: { path: '/no-input', method: 'POST' } },
        output: z.object({ name: z.string() }),
        resolve: () => ({ name: 'jlalmes' }),
      });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[mutation.noInput] - Input parser expects a Zod validator');
    }
  });

  test('with missing output', () => {
    {
      const appRouter = trpc.router<any, OpenApiMeta>().query('noOutput', {
        meta: { openapi: { path: '/no-output', method: 'GET' } },
        input: z.object({ name: z.string() }),
        resolve: ({ input }) => ({ name: input.name }),
      });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[query.noOutput] - Output parser expects a Zod validator');
    }
    {
      const appRouter = trpc.router<any, OpenApiMeta>().mutation('noOutput', {
        meta: { openapi: { path: '/no-output', method: 'POST' } },
        input: z.object({ name: z.string() }),
        resolve: ({ input }) => ({ name: input.name }),
      });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[mutation.noOutput] - Output parser expects a Zod validator');
    }
  });

  test('with non-object input', () => {
    {
      const appRouter = trpc.router<any, OpenApiMeta>().query('badInput', {
        meta: { openapi: { path: '/bad-input', method: 'GET' } },
        input: z.string(),
        output: z.null(),
        resolve: () => null,
      });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[query.badInput] - Input parser must be a ZodObject');
    }
    {
      const appRouter = trpc.router<any, OpenApiMeta>().mutation('badInput', {
        meta: { openapi: { path: '/bad-input', method: 'POST' } },
        input: z.string(),
        output: z.null(),
        resolve: () => null,
      });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[mutation.badInput] - Input parser must be a ZodObject');
    }
  });

  test('with object non-string input', () => {
    {
      const appRouter = trpc.router<any, OpenApiMeta>().query('badInput', {
        meta: { openapi: { path: '/bad-input', method: 'GET' } },
        input: z.object({ age: z.number() }),
        output: z.object({ name: z.string() }),
        resolve: () => ({ name: 'jlalmes' }),
      });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[query.badInput] - Input parser key: "age" must be ZodString');
    }
    {
      const appRouter = trpc.router<any, OpenApiMeta>().mutation('okInput', {
        meta: { openapi: { path: '/ok-input', method: 'POST' } },
        input: z.object({ age: z.number().min(0).max(122) }), // RIP Jeanne Calment
        output: z.object({ name: z.string() }),
        resolve: () => ({ name: 'jlalmes' }),
      });

      const openApiDocument = generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });

      expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
      expect(openApiDocument.paths['/ok-input']!.post!.requestBody).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "application/json": Object {
              "schema": Object {
                "additionalProperties": false,
                "properties": Object {
                  "age": Object {
                    "maximum": 122,
                    "minimum": 0,
                    "type": "number",
                  },
                },
                "required": Array [
                  "age",
                ],
                "type": "object",
              },
            },
          },
          "required": true,
        }
      `);
    }
  });

  test('with bad method', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('badMethod', {
      // @ts-expect-error - bad method
      meta: { openapi: { path: '/bad-method', method: 'BAD_METHOD' } },
      input: z.object({ name: z.string() }),
      output: z.object({ name: z.string() }),
      resolve: ({ input }) => ({ name: input.name }),
    });

    expect(() => {
      generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });
    }).toThrowError('[query.badMethod] - Method must be GET, POST, PATCH, PUT or DELETE');
  });

  test('with duplicate routes', () => {
    {
      const appRouter = trpc
        .router<any, OpenApiMeta>()
        .query('procedure1', {
          meta: { openapi: { path: '/procedure', method: 'GET' } },
          input: z.object({ name: z.string() }),
          output: z.object({ name: z.string() }),
          resolve: ({ input }) => ({ name: input.name }),
        })
        .query('procedure2', {
          meta: { openapi: { path: '/procedure', method: 'GET' } },
          input: z.object({ name: z.string() }),
          output: z.object({ name: z.string() }),
          resolve: ({ input }) => ({ name: input.name }),
        });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[query.procedure2] - Duplicate procedure defined for route GET /procedure');
    }
    {
      const appRouter = trpc
        .router<any, OpenApiMeta>()
        .query('procedure1', {
          meta: { openapi: { path: '/procedure/', method: 'GET' } },
          input: z.object({ name: z.string() }),
          output: z.object({ name: z.string() }),
          resolve: ({ input }) => ({ name: input.name }),
        })
        .query('procedure2', {
          meta: { openapi: { path: '/procedure', method: 'GET' } },
          input: z.object({ name: z.string() }),
          output: z.object({ name: z.string() }),
          resolve: ({ input }) => ({ name: input.name }),
        });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[query.procedure2] - Duplicate procedure defined for route GET /procedure');
    }
  });

  test('with unsupported subscription', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().subscription('currentName', {
      meta: { openapi: { path: '/current-name', method: 'PATCH' } },
      input: z.object({ name: z.string() }),
      resolve: ({ input }) =>
        new Subscription((emit) => {
          emit.data(input.name);
          return () => undefined;
        }),
    });

    expect(() => {
      generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });
    }).toThrowError('[subscription.currentName] - Subscriptions are not supported by OpenAPI v3');
  });

  test('with void and path parameters', () => {
    const appRouter = trpc.router().query('pathParameters', {
      meta: { openapi: { path: '/path-parameters/{name}', method: 'GET' } },
      input: z.void(),
      output: z.object({ name: z.string() }),
      resolve: () => ({ name: 'asdf' }),
    });

    expect(() => {
      generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });
    }).toThrowError('[query.pathParameters] - Input parser must be a ZodObject');
  });

  test('with optional path parameters', () => {
    const appRouter = trpc.router().query('pathParameters', {
      meta: { openapi: { path: '/path-parameters/{name}', method: 'GET' } },
      input: z.object({ name: z.string().optional() }),
      output: z.object({ name: z.string() }),
      resolve: () => ({ name: 'asdf' }),
    });

    expect(() => {
      generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });
    }).toThrowError('[query.pathParameters] - Path parameter: "name" must not be optional');
  });

  test('with missing path parameters', () => {
    const appRouter = trpc.router().query('pathParameters', {
      meta: { openapi: { path: '/path-parameters/{name}', method: 'GET' } },
      input: z.object({}),
      output: z.object({ name: z.string() }),
      resolve: () => ({ name: 'asdf' }),
    });

    expect(() => {
      generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });
    }).toThrowError('[query.pathParameters] - Input parser expects key from path: "name"');
  });

  test('with valid procedures', () => {
    const appRouter = trpc
      .router<any, OpenApiMeta>()
      .mutation('createUser', {
        meta: { openapi: { path: '/users', method: 'POST' } },
        input: z.object({ name: z.string() }),
        output: z.object({ id: z.string(), name: z.string() }),
        resolve: ({ input }) => ({ id: 'user-id', name: input.name }),
      })
      .query('readUsers', {
        meta: { openapi: { path: '/users', method: 'GET' } },
        input: z.void(),
        output: z.array(z.object({ id: z.string(), name: z.string() })),
        resolve: () => [{ id: 'user-id', name: 'name' }],
      })
      .query('readUser', {
        meta: { openapi: { path: '/users/{id}', method: 'GET' } },
        input: z.object({ id: z.string() }),
        output: z.object({ id: z.string(), name: z.string() }),
        resolve: ({ input }) => ({ id: input.id, name: 'name' }),
      })
      .mutation('updateUser', {
        meta: { openapi: { path: '/users/{id}', method: 'PATCH' } },
        input: z.object({ id: z.string(), name: z.string().optional() }),
        output: z.object({ id: z.string(), name: z.string() }),
        resolve: ({ input }) => ({ id: input.id, name: input.name ?? 'name' }),
      })
      .mutation('deleteUser', {
        meta: { openapi: { path: '/users/{id}', method: 'DELETE' } },
        input: z.object({ id: z.string() }),
        output: z.void(),
        resolve: () => undefined,
      });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument).toMatchInlineSnapshot(`
      Object {
        "components": Object {
          "responses": Object {
            "error": Object {
              "content": Object {
                "application/json": Object {
                  "schema": Object {
                    "additionalProperties": false,
                    "properties": Object {
                      "code": Object {
                        "type": "string",
                      },
                      "issues": Object {
                        "items": Object {
                          "additionalProperties": false,
                          "properties": Object {
                            "message": Object {
                              "type": "string",
                            },
                          },
                          "required": Array [
                            "message",
                          ],
                          "type": "object",
                        },
                        "type": "array",
                      },
                      "message": Object {
                        "type": "string",
                      },
                    },
                    "required": Array [
                      "message",
                      "code",
                    ],
                    "type": "object",
                  },
                },
              },
              "description": "Error response",
            },
          },
          "securitySchemes": Object {
            "Authorization": Object {
              "scheme": "bearer",
              "type": "http",
            },
          },
        },
        "externalDocs": undefined,
        "info": Object {
          "description": undefined,
          "title": "tRPC OpenAPI",
          "version": "1.0.0",
        },
        "openapi": "3.0.3",
        "paths": Object {
          "/users": Object {
            "get": Object {
              "description": undefined,
              "operationId": "query.readUsers",
              "parameters": Array [],
              "responses": Object {
                "200": Object {
                  "content": Object {
                    "application/json": Object {
                      "schema": Object {
                        "items": Object {
                          "additionalProperties": false,
                          "properties": Object {
                            "id": Object {
                              "type": "string",
                            },
                            "name": Object {
                              "type": "string",
                            },
                          },
                          "required": Array [
                            "id",
                            "name",
                          ],
                          "type": "object",
                        },
                        "type": "array",
                      },
                    },
                  },
                  "description": "Successful response",
                },
                "default": Object {
                  "$ref": "#/components/responses/error",
                },
              },
              "security": undefined,
              "summary": undefined,
              "tags": undefined,
            },
            "post": Object {
              "description": undefined,
              "operationId": "mutation.createUser",
              "parameters": Array [],
              "requestBody": Object {
                "content": Object {
                  "application/json": Object {
                    "schema": Object {
                      "additionalProperties": false,
                      "properties": Object {
                        "name": Object {
                          "type": "string",
                        },
                      },
                      "required": Array [
                        "name",
                      ],
                      "type": "object",
                    },
                  },
                },
                "required": true,
              },
              "responses": Object {
                "200": Object {
                  "content": Object {
                    "application/json": Object {
                      "schema": Object {
                        "additionalProperties": false,
                        "properties": Object {
                          "id": Object {
                            "type": "string",
                          },
                          "name": Object {
                            "type": "string",
                          },
                        },
                        "required": Array [
                          "id",
                          "name",
                        ],
                        "type": "object",
                      },
                    },
                  },
                  "description": "Successful response",
                },
                "default": Object {
                  "$ref": "#/components/responses/error",
                },
              },
              "security": undefined,
              "summary": undefined,
              "tags": undefined,
            },
          },
          "/users/{id}": Object {
            "delete": Object {
              "description": undefined,
              "operationId": "mutation.deleteUser",
              "parameters": Array [
                Object {
                  "description": undefined,
                  "in": "path",
                  "name": "id",
                  "required": true,
                  "schema": Object {
                    "type": "string",
                  },
                },
              ],
              "responses": Object {
                "200": Object {
                  "content": Object {
                    "application/json": Object {
                      "schema": undefined,
                    },
                  },
                  "description": "Successful response",
                },
                "default": Object {
                  "$ref": "#/components/responses/error",
                },
              },
              "security": undefined,
              "summary": undefined,
              "tags": undefined,
            },
            "get": Object {
              "description": undefined,
              "operationId": "query.readUser",
              "parameters": Array [
                Object {
                  "description": undefined,
                  "in": "path",
                  "name": "id",
                  "required": true,
                  "schema": Object {
                    "type": "string",
                  },
                },
              ],
              "responses": Object {
                "200": Object {
                  "content": Object {
                    "application/json": Object {
                      "schema": Object {
                        "additionalProperties": false,
                        "properties": Object {
                          "id": Object {
                            "type": "string",
                          },
                          "name": Object {
                            "type": "string",
                          },
                        },
                        "required": Array [
                          "id",
                          "name",
                        ],
                        "type": "object",
                      },
                    },
                  },
                  "description": "Successful response",
                },
                "default": Object {
                  "$ref": "#/components/responses/error",
                },
              },
              "security": undefined,
              "summary": undefined,
              "tags": undefined,
            },
            "patch": Object {
              "description": undefined,
              "operationId": "mutation.updateUser",
              "parameters": Array [
                Object {
                  "description": undefined,
                  "in": "path",
                  "name": "id",
                  "required": true,
                  "schema": Object {
                    "type": "string",
                  },
                },
              ],
              "requestBody": Object {
                "content": Object {
                  "application/json": Object {
                    "schema": Object {
                      "additionalProperties": false,
                      "properties": Object {
                        "name": Object {
                          "type": "string",
                        },
                      },
                      "type": "object",
                    },
                  },
                },
                "required": true,
              },
              "responses": Object {
                "200": Object {
                  "content": Object {
                    "application/json": Object {
                      "schema": Object {
                        "additionalProperties": false,
                        "properties": Object {
                          "id": Object {
                            "type": "string",
                          },
                          "name": Object {
                            "type": "string",
                          },
                        },
                        "required": Array [
                          "id",
                          "name",
                        ],
                        "type": "object",
                      },
                    },
                  },
                  "description": "Successful response",
                },
                "default": Object {
                  "$ref": "#/components/responses/error",
                },
              },
              "security": undefined,
              "summary": undefined,
              "tags": undefined,
            },
          },
        },
        "servers": Array [
          Object {
            "url": "http://localhost:3000/api",
          },
        ],
        "tags": undefined,
      }
    `);
  });

  test('with disabled', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('getMe', {
      meta: { openapi: { enabled: false, path: '/me', method: 'GET' } },
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string() }),
      resolve: ({ input }) => ({ id: input.id }),
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(Object.keys(openApiDocument.paths).length).toBe(0);
  });

  test('with summary, description & multiple tags', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('all.metadata', {
      meta: {
        openapi: {
          path: '/metadata/all',
          method: 'GET',
          summary: 'Short summary',
          description: 'Verbose description',
          tags: ['tagA', 'tagB'],
        },
      },
      input: z.object({ name: z.string() }),
      output: z.object({ name: z.string() }),
      resolve: ({ input }) => ({ name: input.name }),
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/metadata/all']!.get!.summary).toBe('Short summary');
    expect(openApiDocument.paths['/metadata/all']!.get!.description).toBe('Verbose description');
    expect(openApiDocument.paths['/metadata/all']!.get!.tags).toEqual(['tagA', 'tagB']);
  });

  // @deprecated
  test('with single tag', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('all.metadata', {
      meta: {
        openapi: {
          path: '/metadata/all',
          method: 'GET',
          tag: 'tag',
        },
      },
      input: z.object({ name: z.string() }),
      output: z.object({ name: z.string() }),
      resolve: ({ input }) => ({ name: input.name }),
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/metadata/all']!.get!.tags).toEqual(['tag']);
  });

  test('with security', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().mutation('protectedEndpoint', {
      meta: {
        openapi: {
          path: '/secure/endpoint',
          method: 'POST',
          protect: true,
        },
      },
      input: z.object({ name: z.string() }),
      output: z.object({ name: z.string() }),
      resolve: ({ input }) => ({ name: input.name }),
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/secure/endpoint']!.post!.security).toEqual([
      { Authorization: [] },
    ]);
  });

  test('with schema descriptions', () => {
    const appRouter = trpc
      .router<any, OpenApiMeta>()
      .mutation('createUser', {
        meta: { openapi: { path: '/user', method: 'POST' } },
        input: z
          .object({
            id: z.string().uuid().describe('User ID'),
            name: z.string().describe('User name'),
          })
          .describe('Request body input'),
        output: z
          .object({
            id: z.string().uuid().describe('User ID'),
            name: z.string().describe('User name'),
          })
          .describe('User data'),
        resolve: ({ input }) => ({ id: input.id, name: 'James' }),
      })
      .query('getUser', {
        meta: { openapi: { path: '/user', method: 'GET' } },
        input: z
          .object({ id: z.string().uuid().describe('User ID') })
          .describe('Query string inputs'),
        output: z
          .object({
            id: z.string().uuid().describe('User ID'),
            name: z.string().describe('User name'),
          })
          .describe('User data'),
        resolve: ({ input }) => ({ id: input.id, name: 'James' }),
      });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/user']!.post!).toMatchInlineSnapshot(`
      Object {
        "description": undefined,
        "operationId": "mutation.createUser",
        "parameters": Array [],
        "requestBody": Object {
          "content": Object {
            "application/json": Object {
              "schema": Object {
                "additionalProperties": false,
                "description": "Request body input",
                "properties": Object {
                  "id": Object {
                    "description": "User ID",
                    "format": "uuid",
                    "type": "string",
                  },
                  "name": Object {
                    "description": "User name",
                    "type": "string",
                  },
                },
                "required": Array [
                  "id",
                  "name",
                ],
                "type": "object",
              },
            },
          },
          "required": true,
        },
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/json": Object {
                "schema": Object {
                  "additionalProperties": false,
                  "description": "User data",
                  "properties": Object {
                    "id": Object {
                      "description": "User ID",
                      "format": "uuid",
                      "type": "string",
                    },
                    "name": Object {
                      "description": "User name",
                      "type": "string",
                    },
                  },
                  "required": Array [
                    "id",
                    "name",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "Successful response",
          },
          "default": Object {
            "$ref": "#/components/responses/error",
          },
        },
        "security": undefined,
        "summary": undefined,
        "tags": undefined,
      }
    `);
    expect(openApiDocument.paths['/user']!.get!).toMatchInlineSnapshot(`
      Object {
        "description": undefined,
        "operationId": "query.getUser",
        "parameters": Array [
          Object {
            "description": "User ID",
            "in": "query",
            "name": "id",
            "required": true,
            "schema": Object {
              "format": "uuid",
              "type": "string",
            },
          },
        ],
        "responses": Object {
          "200": Object {
            "content": Object {
              "application/json": Object {
                "schema": Object {
                  "additionalProperties": false,
                  "description": "User data",
                  "properties": Object {
                    "id": Object {
                      "description": "User ID",
                      "format": "uuid",
                      "type": "string",
                    },
                    "name": Object {
                      "description": "User name",
                      "type": "string",
                    },
                  },
                  "required": Array [
                    "id",
                    "name",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "Successful response",
          },
          "default": Object {
            "$ref": "#/components/responses/error",
          },
        },
        "security": undefined,
        "summary": undefined,
        "tags": undefined,
      }
    `);
  });

  test('with void', () => {
    {
      const appRouter = trpc.router<any, OpenApiMeta>().query('void', {
        meta: { openapi: { path: '/void', method: 'GET' } },
        input: z.void(),
        output: z.void(),
        resolve: () => undefined,
      });

      const openApiDocument = generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });

      expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
      expect(openApiDocument.paths['/void']!.get!.parameters).toEqual([]);
      expect(openApiDocument.paths['/void']!.get!.responses[200]).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "application/json": Object {
              "schema": undefined,
            },
          },
          "description": "Successful response",
        }
      `);
    }
    {
      const appRouter = trpc.router<any, OpenApiMeta>().mutation('void', {
        meta: { openapi: { path: '/void', method: 'POST' } },
        input: z.void(),
        output: z.void(),
        resolve: () => undefined,
      });

      const openApiDocument = generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });

      expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
      expect(openApiDocument.paths['/void']!.post!.requestBody).toMatchInlineSnapshot(`undefined`);
      expect(openApiDocument.paths['/void']!.post!.responses[200]).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": undefined,
          },
        },
        "description": "Successful response",
      }
    `);
    }
  });

  test('with null', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().mutation('null', {
      meta: { openapi: { path: '/null', method: 'POST' } },
      input: z.void(),
      output: z.null(),
      resolve: () => null,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/null']!.post!.responses[200]).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": Object {
              "enum": Array [
                "null",
              ],
              "nullable": true,
            },
          },
        },
        "description": "Successful response",
      }
    `);
  });

  test('with undefined', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().mutation('undefined', {
      meta: { openapi: { path: '/undefined', method: 'POST' } },
      input: z.undefined(),
      output: z.undefined(),
      resolve: () => undefined,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/undefined']!.post!.requestBody).toMatchInlineSnapshot(
      `undefined`,
    );
    expect(openApiDocument.paths['/undefined']!.post!.responses[200]).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": Object {
              "not": Object {},
            },
          },
        },
        "description": "Successful response",
      }
    `);
  });

  test('with nullish', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().mutation('nullish', {
      meta: { openapi: { path: '/nullish', method: 'POST' } },
      input: z.void(),
      output: z.string().nullish(),
      resolve: () => null,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/nullish']!.post!.responses[200]).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": Object {
              "anyOf": Array [
                Object {
                  "not": Object {},
                },
                Object {
                  "type": "string",
                },
              ],
              "nullable": true,
            },
          },
        },
        "description": "Successful response",
      }
    `);
  });

  test('with never', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().mutation('never', {
      meta: { openapi: { path: '/never', method: 'POST' } },
      input: z.never(),
      output: z.never(),
      // @ts-expect-error - cannot return never
      resolve: () => undefined,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/never']!.post!.requestBody).toMatchInlineSnapshot(`undefined`);
    expect(openApiDocument.paths['/never']!.post!.responses[200]).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": Object {
              "not": Object {},
            },
          },
        },
        "description": "Successful response",
      }
    `);
  });

  test('with optional', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('optional', {
      meta: { openapi: { path: '/optional', method: 'GET' } },
      input: z.object({ payload: z.string().optional() }),
      output: z.string().optional(),
      resolve: ({ input }) => input.payload,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/optional']!.get!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": undefined,
          "in": "query",
          "name": "payload",
          "required": false,
          "schema": Object {
            "type": "string",
          },
        },
      ]
    `);
    expect(openApiDocument.paths['/optional']!.get!.responses[200]).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": Object {
              "anyOf": Array [
                Object {
                  "not": Object {},
                },
                Object {
                  "type": "string",
                },
              ],
            },
          },
        },
        "description": "Successful response",
      }
    `);
  });

  test('with default', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('default', {
      meta: { openapi: { path: '/default', method: 'GET' } },
      input: z.object({ payload: z.string().default('James') }),
      output: z.string().default('James'),
      resolve: ({ input }) => input.payload,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/default']!.get!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": undefined,
          "in": "query",
          "name": "payload",
          "required": false,
          "schema": Object {
            "default": "James",
            "type": "string",
          },
        },
      ]
    `);
    expect(openApiDocument.paths['/default']!.get!.responses[200]).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": Object {
              "default": "James",
              "type": "string",
            },
          },
        },
        "description": "Successful response",
      }
    `);
  });

  test('with refine', () => {
    {
      const appRouter = trpc.router<any, OpenApiMeta>().mutation('refine', {
        meta: { openapi: { path: '/refine', method: 'POST' } },
        input: z.object({ a: z.string().refine((arg) => arg.length > 10) }),
        output: z.null(),
        resolve: () => null,
      });

      const openApiDocument = generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });

      expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
      expect(openApiDocument.paths['/refine']!.post!.requestBody).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "application/json": Object {
              "schema": Object {
                "additionalProperties": false,
                "properties": Object {
                  "a": Object {
                    "type": "string",
                  },
                },
                "required": Array [
                  "a",
                ],
                "type": "object",
              },
            },
          },
          "required": true,
        }
      `);
    }
    {
      const appRouter = trpc.router<any, OpenApiMeta>().mutation('objectRefine', {
        meta: { openapi: { path: '/object-refine', method: 'POST' } },
        input: z.object({ a: z.string(), b: z.string() }).refine((data) => data.a === data.b),
        output: z.null(),
        resolve: () => null,
      });

      const openApiDocument = generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });

      expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
      expect(openApiDocument.paths['/object-refine']!.post!.requestBody).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "application/json": Object {
              "schema": Object {
                "additionalProperties": false,
                "properties": Object {
                  "a": Object {
                    "type": "string",
                  },
                  "b": Object {
                    "type": "string",
                  },
                },
                "required": Array [
                  "a",
                  "b",
                ],
                "type": "object",
              },
            },
          },
          "required": true,
        }
      `);
    }
  });

  test('with transform', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('transform', {
      meta: { openapi: { path: '/transform', method: 'GET' } },
      input: z.object({ age: z.string().transform((input) => parseInt(input)) }),
      output: z.object({ age: z.number() }),
      resolve: ({ input }) => ({ age: input.age }),
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/transform']!.get!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": undefined,
          "in": "query",
          "name": "age",
          "required": true,
          "schema": Object {
            "type": "string",
          },
        },
      ]
    `);
  });

  test('with preprocess', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('preprocess', {
      meta: { openapi: { path: '/preprocess', method: 'GET' } },
      input: z.object({
        payload: z.preprocess((arg) => {
          if (typeof arg === 'string') {
            return parseInt(arg);
          }
          return arg;
        }, z.number()),
      }),
      output: z.number(),
      resolve: ({ input }) => input.payload,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/preprocess']!.get!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": undefined,
          "in": "query",
          "name": "payload",
          "required": true,
          "schema": Object {
            "type": "number",
          },
        },
      ]
    `);
    expect(openApiDocument.paths['/preprocess']!.get!.responses[200]).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": Object {
              "type": "number",
            },
          },
        },
        "description": "Successful response",
      }
    `);
  });

  test('with union', () => {
    {
      const appRouter = trpc.router<any, OpenApiMeta>().query('union', {
        meta: { openapi: { path: '/union', method: 'GET' } },
        input: z.object({ payload: z.string().or(z.number()) }),
        output: z.null(),
        resolve: () => null,
      });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[query.union] - Input parser key: "payload" must be ZodString');
    }
    {
      const appRouter = trpc.router<any, OpenApiMeta>().query('union', {
        meta: { openapi: { path: '/union', method: 'GET' } },
        input: z.object({ payload: z.string().or(z.literal('James')) }),
        output: z.null(),
        resolve: () => null,
      });

      const openApiDocument = generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });

      expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
      expect(openApiDocument.paths['/union']!.get!.parameters).toMatchInlineSnapshot(`
        Array [
          Object {
            "description": undefined,
            "in": "query",
            "name": "payload",
            "required": true,
            "schema": Object {
              "anyOf": Array [
                Object {
                  "type": "string",
                },
                Object {
                  "enum": Array [
                    "James",
                  ],
                  "type": "string",
                },
              ],
            },
          },
        ]
      `);
    }
  });

  test('with intersection', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('intersection', {
      meta: { openapi: { path: '/intersection', method: 'GET' } },
      input: z.object({
        payload: z.intersection(
          z.union([z.literal('a'), z.literal('b')]),
          z.union([z.literal('b'), z.literal('c')]),
        ),
      }),
      output: z.null(),
      resolve: () => null,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/intersection']!.get!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": undefined,
          "in": "query",
          "name": "payload",
          "required": true,
          "schema": Object {
            "allOf": Array [
              Object {
                "anyOf": Array [
                  Object {
                    "enum": Array [
                      "a",
                    ],
                    "type": "string",
                  },
                  Object {
                    "enum": Array [
                      "b",
                    ],
                    "type": "string",
                  },
                ],
              },
              Object {
                "anyOf": Array [
                  Object {
                    "enum": Array [
                      "b",
                    ],
                    "type": "string",
                  },
                  Object {
                    "enum": Array [
                      "c",
                    ],
                    "type": "string",
                  },
                ],
              },
            ],
          },
        },
      ]
    `);
  });

  test('with lazy', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('lazy', {
      meta: { openapi: { path: '/lazy', method: 'GET' } },
      input: z.object({ payload: z.lazy(() => z.string()) }),
      output: z.null(),
      resolve: () => null,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/lazy']!.get!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": undefined,
          "in": "query",
          "name": "payload",
          "required": true,
          "schema": Object {
            "type": "string",
          },
        },
      ]
    `);
  });

  test('with literal', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('literal', {
      meta: { openapi: { path: '/literal', method: 'GET' } },
      input: z.object({ payload: z.literal('literal') }),
      output: z.null(),
      resolve: () => null,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/literal']!.get!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": undefined,
          "in": "query",
          "name": "payload",
          "required": true,
          "schema": Object {
            "enum": Array [
              "literal",
            ],
            "type": "string",
          },
        },
      ]
    `);
  });

  test('with enum', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('enum', {
      meta: { openapi: { path: '/enum', method: 'GET' } },
      input: z.object({ name: z.enum(['James', 'jlalmes']) }),
      output: z.null(),
      resolve: () => null,
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/enum']!.get!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": undefined,
          "in": "query",
          "name": "name",
          "required": true,
          "schema": Object {
            "enum": Array [
              "James",
              "jlalmes",
            ],
            "type": "string",
          },
        },
      ]
    `);
  });

  test('with native-enum', () => {
    {
      enum InvalidEnum {
        James,
        jlalmes,
      }

      const appRouter = trpc.router<any, OpenApiMeta>().query('nativeEnum', {
        meta: { openapi: { path: '/nativeEnum', method: 'GET' } },
        input: z.object({ name: z.nativeEnum(InvalidEnum) }),
        output: z.null(),
        resolve: () => null,
      });

      expect(() => {
        generateOpenApiDocument(appRouter, {
          title: 'tRPC OpenAPI',
          version: '1.0.0',
          baseUrl: 'http://localhost:3000/api',
        });
      }).toThrowError('[query.nativeEnum] - Input parser key: "name" must be ZodString');
    }
    {
      enum ValidEnum {
        James = 'James',
        jlalmes = 'jlalmes',
      }

      const appRouter = trpc.router<any, OpenApiMeta>().query('nativeEnum', {
        meta: { openapi: { path: '/nativeEnum', method: 'GET' } },
        input: z.object({ name: z.nativeEnum(ValidEnum) }),
        output: z.null(),
        resolve: () => null,
      });

      const openApiDocument = generateOpenApiDocument(appRouter, {
        title: 'tRPC OpenAPI',
        version: '1.0.0',
        baseUrl: 'http://localhost:3000/api',
      });

      expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
      expect(openApiDocument.paths['/nativeEnum']!.get!.parameters).toMatchInlineSnapshot(`
        Array [
          Object {
            "description": undefined,
            "in": "query",
            "name": "name",
            "required": true,
            "schema": Object {
              "enum": Array [
                "James",
                "jlalmes",
              ],
              "type": "string",
            },
          },
        ]
      `);
    }
  });

  test('with no refs', () => {
    const schemas = { emails: z.array(z.string().email()) };

    const appRouter = trpc.router<any, OpenApiMeta>().mutation('refs', {
      meta: { openapi: { method: 'POST', path: '/refs' } },
      input: z.object({ allowed: schemas.emails, blocked: schemas.emails }),
      output: z.object({ allowed: schemas.emails, blocked: schemas.emails }),
      resolve: () => ({ allowed: [], blocked: [] }),
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/refs']!.post!.requestBody).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": Object {
              "additionalProperties": false,
              "properties": Object {
                "allowed": Object {
                  "items": Object {
                    "format": "email",
                    "type": "string",
                  },
                  "type": "array",
                },
                "blocked": Object {
                  "items": Object {
                    "format": "email",
                    "type": "string",
                  },
                  "type": "array",
                },
              },
              "required": Array [
                "allowed",
                "blocked",
              ],
              "type": "object",
            },
          },
        },
        "required": true,
      }
    `);
    expect(openApiDocument.paths['/refs']!.post!.responses[200]).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": Object {
              "additionalProperties": false,
              "properties": Object {
                "allowed": Object {
                  "items": Object {
                    "format": "email",
                    "type": "string",
                  },
                  "type": "array",
                },
                "blocked": Object {
                  "items": Object {
                    "format": "email",
                    "type": "string",
                  },
                  "type": "array",
                },
              },
              "required": Array [
                "allowed",
                "blocked",
              ],
              "type": "object",
            },
          },
        },
        "description": "Successful response",
      }
    `);
  });

  test('with custom header', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().query('echo', {
      meta: {
        openapi: {
          path: '/echo',
          method: 'GET',
          headers: [
            {
              name: 'x-custom-header',
              required: true,
              description: 'Some custom header',
            },
          ],
        },
      },
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string() }),
      resolve: ({ input }) => ({ id: input.id }),
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/echo']!.get!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": "Some custom header",
          "in": "header",
          "name": "x-custom-header",
          "required": true,
        },
        Object {
          "description": undefined,
          "in": "query",
          "name": "id",
          "required": true,
          "schema": Object {
            "type": "string",
          },
        },
      ]
    `);
  });

  test('with DELETE method mutation', () => {
    const appRouter = trpc.router<any, OpenApiMeta>().mutation('deleteThing', {
      meta: { openapi: { path: '/thing/delete', method: 'DELETE' } },
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string() }),
      resolve: ({ input }) => ({ id: input.id }),
    });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/thing/delete']!.delete!.requestBody).toMatchInlineSnapshot(
      `undefined`,
    );
    expect(openApiDocument.paths['/thing/delete']!.delete!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": undefined,
          "in": "query",
          "name": "id",
          "required": true,
          "schema": Object {
            "type": "string",
          },
        },
      ]
    `);
  });

  test('with top-level preprocess', () => {
    const appRouter = trpc
      .router<any, OpenApiMeta>()
      .query('topLevelPreprocess', {
        meta: { openapi: { path: '/top-level-preprocess', method: 'GET' } },
        input: z.preprocess((arg) => arg, z.object({ id: z.string() })),
        output: z.preprocess((arg) => arg, z.object({ id: z.string() })),
        resolve: ({ input }) => ({ id: input.id }),
      })
      .mutation('topLevelPreprocess', {
        meta: { openapi: { path: '/top-level-preprocess', method: 'POST' } },
        input: z.preprocess((arg) => arg, z.object({ id: z.string() })),
        output: z.preprocess((arg) => arg, z.object({ id: z.string() })),
        resolve: ({ input }) => ({ id: input.id }),
      });

    const openApiDocument = generateOpenApiDocument(appRouter, {
      title: 'tRPC OpenAPI',
      version: '1.0.0',
      baseUrl: 'http://localhost:3000/api',
    });

    expect(openApiSchemaValidator.validate(openApiDocument).errors).toEqual([]);
    expect(openApiDocument.paths['/top-level-preprocess']!.get!.parameters).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": undefined,
          "in": "query",
          "name": "id",
          "required": true,
          "schema": Object {
            "type": "string",
          },
        },
      ]
    `);
    expect(openApiDocument.paths['/top-level-preprocess']!.post!.requestBody)
      .toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "application/json": Object {
            "schema": Object {
              "additionalProperties": false,
              "properties": Object {
                "id": Object {
                  "type": "string",
                },
              },
              "required": Array [
                "id",
              ],
              "type": "object",
            },
          },
        },
        "required": true,
      }
    `);
  });
});
