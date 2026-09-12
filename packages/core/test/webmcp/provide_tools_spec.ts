/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideRouter, Router, withAutoCleanupInjectors} from '@angular/router';
import {cleanupWebMCPPolyfill, initializeWebMCPPolyfill} from '@mcp-b/webmcp-polyfill';
import {ModelContext} from '@mcp-b/webmcp-types';
import {Component, createEnvironmentInjector, EnvironmentInjector} from '../../src/core';
import {provideExperimentalWebMcpTools} from '../../src/webmcp/provide_tools';
import {Execute} from '../../src/webmcp/types';
import {TestBed} from '../../testing';
import type {JsonSchemaForInference} from '../../third_party/@mcp-b/webmcp-types';

describe('provideExperimentalWebMcpTools', () => {
  beforeEach(() => {
    // Firefox throws a security error with this.
    Object.defineProperty(globalThis, 'originAgentCluster', {
      value: true,
      configurable: true,
    });
    initializeWebMCPPolyfill({installTestingShim: true});
  });

  afterEach(() => {
    cleanupWebMCPPolyfill();
  });

  it('should register tools when initialized', async () => {
    const execute = jasmine.createSpy<Execute<JsonSchemaForInference>>('execute').and.returnValue({
      content: [{type: 'text', text: 'Hello!'}],
    });

    const envInjector = createEnvironmentInjector(
      [
        provideExperimentalWebMcpTools([
          {
            name: 'testTool',
            description: 'A test tool',
            inputSchema: {type: 'object', properties: {}},
            execute,
          },
        ]),
      ],
      TestBed.inject(EnvironmentInjector),
    );

    expect(await getModelContext()!.getTools()).toEqual([
      jasmine.objectContaining({name: 'testTool'}),
    ]);

    const tools = await getModelContext()!.getTools();
    const testTool = tools.find((t: any) => t.name === 'testTool')!;
    await (getModelContext() as any).executeTool(testTool, '{}');
    expect(execute).toHaveBeenCalledOnceWith({}, jasmine.any(Object));

    envInjector.destroy();
  });

  it('should unregister tools when the injector is destroyed', async () => {
    const envInjector = createEnvironmentInjector(
      [
        provideExperimentalWebMcpTools([
          {
            name: 'testTool',
            description: 'A test tool',
            inputSchema: {type: 'object', properties: {}},
            execute: async () => ({content: []}),
          },
        ]),
      ],
      TestBed.inject(EnvironmentInjector),
    );

    expect(await getModelContext()!.getTools()).toEqual([
      jasmine.objectContaining({name: 'testTool'}),
    ]);

    envInjector.destroy();

    expect(await getModelContext()!.getTools()).toEqual([]);
  });

  it('should work with route providers', async () => {
    @Component({
      selector: 'test-comp',
      template: '',
    })
    class TestComp {}

    TestBed.configureTestingModule({
      imports: [TestComp],
      providers: [
        provideRouter(
          [
            {
              path: 'test',
              component: TestComp,
              providers: [
                provideExperimentalWebMcpTools([
                  {
                    name: 'routeTool',
                    description: 'A route tool',
                    inputSchema: {type: 'object', properties: {}},
                    execute: async () => ({content: []}),
                  },
                ]),
              ],
            },
          ],
          withAutoCleanupInjectors(),
        ),
      ],
    });

    const router = TestBed.inject(Router);
    const rootFixture = TestBed.createComponent(TestComp);
    await rootFixture.whenStable();

    // No tools should be registered initially
    expect(await getModelContext()!.getTools()).toEqual([]);

    // Navigate to the route to register the tools
    await router.navigateByUrl('/test');
    expect(await getModelContext()!.getTools()).toEqual([
      jasmine.objectContaining({name: 'routeTool'}),
    ]);

    // Navigate away to destroy route environment injector context
    await router.navigateByUrl('/');
    expect(await getModelContext()!.getTools()).toEqual([]);
  });
});

function getModelContext(): ModelContext {
  return (globalThis as any).document?.modelContext;
}
