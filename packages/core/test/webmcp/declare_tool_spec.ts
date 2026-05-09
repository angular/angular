/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initializeWebMCPPolyfill, cleanupWebMCPPolyfill} from '@mcp-b/webmcp-polyfill';
import type {JsonSchemaForInference} from '../../third_party/@mcp-b/webmcp-types';
import {inject, Injectable, Injector, runInInjectionContext} from '../../src/di';
import {declareExperimentalWebMcpTool} from '../../src/webmcp/declare_tool';
import {Execute} from '../../src/webmcp/types';
import {RuntimeErrorCode} from '../../src/errors';

// Whether or not the input type is `any`.
type IsAny<T> = 0 extends 1 & T ? true : false;

// Whether or not the type has an index signature.
type HasIndexSignature<T> = string extends keyof T ? true : false;

describe('declareExperimentalWebMcpTool', () => {
  beforeEach(() => {
    initializeWebMCPPolyfill({installTestingShim: true});
  });

  afterEach(() => {
    cleanupWebMCPPolyfill();
  });

  it('should register a tool', async () => {
    const execute = jasmine.createSpy<Execute<JsonSchemaForInference>>('execute').and.returnValue({
      content: [{type: 'text', text: 'Hello!'}],
    });

    declareExperimentalWebMcpTool(
      {
        name: 'testTool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            arg: {type: 'string'},
          },
        },
        execute,
      },
      Injector.create({providers: []}),
    );

    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([
      jasmine.objectContaining({name: 'testTool'}),
    ]);

    const result = await globalThis.navigator.modelContextTesting!.executeTool(
      'testTool',
      '{"arg": "foo"}',
    );
    expect(execute).toHaveBeenCalledOnceWith({arg: 'foo'}, jasmine.anything());
    expect(JSON.parse(result!)).toEqual({
      content: [{type: 'text', text: 'Hello!'}],
    });
  });

  it('should throw if the tool is already registered', () => {
    const injector = Injector.create({providers: []});

    declareExperimentalWebMcpTool(
      {
        name: 'testTool',
        description: 'A test tool',
        inputSchema: {type: 'object', properties: {}},
        execute: async () => ({content: []}),
      },
      injector,
    );

    expect(() => {
      declareExperimentalWebMcpTool(
        {
          name: 'testTool',
          description: 'Another test tool',
          inputSchema: {type: 'object', properties: {}},
          execute: async () => ({content: []}),
        },
        injector,
      );
    }).toThrowError(/already registered/);
  });

  it('should unregister the tool when its `Injector` is destroyed', () => {
    const injector = Injector.create({providers: []});

    declareExperimentalWebMcpTool(
      {
        name: 'testTool',
        description: 'A test tool',
        inputSchema: {type: 'object', properties: {}},
        execute: async () => ({content: []}),
      },
      injector,
    );

    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([
      jasmine.objectContaining({name: 'testTool'}),
    ]);

    injector.destroy();

    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([]);
  });

  it('should unregister the tool when its injection context is destroyed and no `injector` is provided', () => {
    const injector = Injector.create({providers: []});

    runInInjectionContext(injector, () => {
      declareExperimentalWebMcpTool({
        name: 'testTool',
        description: 'A test tool',
        inputSchema: {type: 'object', properties: {}},
        execute: async () => ({content: []}),
      });
    });

    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([
      jasmine.objectContaining({name: 'testTool'}),
    ]);

    injector.destroy();

    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([]);
  });

  it('should throw when called outside an injection context and no `injector` is provided', () => {
    expect(() => {
      declareExperimentalWebMcpTool({
        name: 'testTool',
        description: 'A test tool',
        inputSchema: {type: 'object', properties: {}},
        execute: async () => ({content: []}),
      });
    }).toThrowMatching((err) => err.code === RuntimeErrorCode.MISSING_INJECTION_CONTEXT);
  });

  it('should pass an `AbortSignal` to the tool and abort it when the injector is destroyed', async () => {
    const injector = Injector.create({providers: []});
    const execute = jasmine
      .createSpy<Execute<JsonSchemaForInference>>('execute')
      .and.returnValue({content: []});

    declareExperimentalWebMcpTool(
      {
        name: 'testTool',
        description: 'A test tool',
        inputSchema: {type: 'object', properties: {}},
        execute,
      },
      injector,
    );

    await globalThis.navigator.modelContextTesting!.executeTool('testTool', '{}');
    const [, {signal}] = execute.calls.first().args;
    expect(signal.aborted).toBeFalse();

    injector.destroy();
    expect(signal.aborted).toBeTrue();
  });

  it('should run `execute` in an injection context', async () => {
    @Injectable()
    class TestService {}

    const injector = Injector.create({
      providers: [TestService],
    });

    let injectedService!: TestService;
    declareExperimentalWebMcpTool(
      {
        name: 'testTool',
        description: 'A test tool',
        inputSchema: {type: 'object', properties: {}},
        execute: () => {
          injectedService = inject(TestService);
          return {content: [{type: 'text', text: ''}]};
        },
      },
      injector,
    );

    await globalThis.navigator.modelContextTesting!.executeTool('testTool', '{}');

    expect(injectedService).toBeInstanceOf(TestService);
  });

  it('should infer correct types from schema', () => {
    // Type-only test, only needs to compile, not execute.
    () => {
      declareExperimentalWebMcpTool(
        {
          name: 'testTool',
          description: 'A test tool',
          inputSchema: {
            type: 'object',
            properties: {
              foo: {type: 'string'},
              bar: {type: 'number'},
            },
            required: ['foo'],
            additionalProperties: false,
          },
          execute: (args) => {
            // Verify assignability.
            const _assignable: {foo?: string; bar?: number} = args;
            const _assignFromHardCoded: typeof args = {foo: '', bar: 0};

            // Explicitly reject `any`.
            const _fooNotAny: IsAny<typeof args.foo> = false;
            const _barNotAny: IsAny<typeof args.bar> = false;

            // Explicitly reject index signature. (`{[x: string]: unknown}`)
            const _noIndexSignature: HasIndexSignature<typeof args> = false;

            return {content: []};
          },
        },
        Injector.create({providers: []}),
      );
    };

    expect().nothing();
  });
});
