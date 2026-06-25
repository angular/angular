/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initializeWebMCPPolyfill, cleanupWebMCPPolyfill} from '@mcp-b/webmcp-polyfill';
import type {JsonSchemaForInference} from '../../third_party/@mcp-b/webmcp-types';
import {Component, createEnvironmentInjector, EnvironmentInjector} from '../../src/core';
import {provideRouter, Router, withExperimentalAutoCleanupInjectors} from '@angular/router';
import {provideExperimentalWebMcpTools} from '../../src/webmcp/provide_tools';
import {Execute} from '../../src/webmcp/types';
import {TestBed} from '../../testing';

describe('provideExperimentalWebMcpTools', () => {
  beforeEach(() => {
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

    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([
      jasmine.objectContaining({name: 'testTool'}),
    ]);

    await globalThis.navigator.modelContextTesting!.executeTool('testTool', '{}');
    expect(execute).toHaveBeenCalledOnceWith({}, jasmine.any(Object));

    envInjector.destroy();
  });

  it('should unregister tools when the injector is destroyed', () => {
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

    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([
      jasmine.objectContaining({name: 'testTool'}),
    ]);

    envInjector.destroy();

    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([]);
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
          withExperimentalAutoCleanupInjectors(),
        ),
      ],
    });

    const router = TestBed.inject(Router);
    const rootFixture = TestBed.createComponent(TestComp);
    await rootFixture.whenStable();

    // No tools should be registered initially
    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([]);

    // Navigate to the route to register the tools
    await router.navigateByUrl('/test');
    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([
      jasmine.objectContaining({name: 'routeTool'}),
    ]);

    // Navigate away to destroy route environment injector context
    await router.navigateByUrl('/');
    expect(globalThis.navigator.modelContextTesting!.listTools()).toEqual([]);
  });
});
