/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideRouter, Router, withAutoCleanupInjectors} from '@angular/router';
import {Component, createEnvironmentInjector, EnvironmentInjector} from '../../src/core';
import {provideExperimentalWebMcpTools} from '../../src/webmcp/provide_tools';
import {Execute} from '../../src/webmcp/types';
import {TestBed} from '../../testing';
import {installWebMcpMock, ModelContextMock, uninstallWebMcpMock} from './webmcp_mock';

describe('provideExperimentalWebMcpTools', () => {
  let modelContext: ModelContextMock;

  beforeEach(() => {
    // Firefox throws a security error with this.
    Object.defineProperty(globalThis, 'originAgentCluster', {
      value: true,
      configurable: true,
    });
    modelContext = installWebMcpMock();
  });

  afterEach(() => {
    uninstallWebMcpMock();
  });

  it('should register tools when initialized', async () => {
    const execute = jasmine.createSpy<Execute>('execute').and.returnValue({
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

    expect(await modelContext.getTools()).toEqual([jasmine.objectContaining({name: 'testTool'})]);

    const tools = await modelContext.getTools();
    const testTool = tools.find((t) => t.name === 'testTool')!;
    await modelContext.executeTool(testTool);
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

    expect(await modelContext.getTools()).toEqual([jasmine.objectContaining({name: 'testTool'})]);

    envInjector.destroy();

    expect(await modelContext.getTools()).toEqual([]);
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
    expect(await modelContext.getTools()).toEqual([]);

    // Navigate to the route to register the tools
    await router.navigateByUrl('/test');
    expect(await modelContext.getTools()).toEqual([jasmine.objectContaining({name: 'routeTool'})]);

    // Navigate away to destroy route environment injector context
    await router.navigateByUrl('/');
    expect(await modelContext.getTools()).toEqual([]);
  });
});
