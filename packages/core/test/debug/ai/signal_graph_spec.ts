/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, effect, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {signalGraphTool} from '../../../src/debug/ai/signal_graph';
import {setupFrameworkInjectorProfiler} from '../../../src/render3/debug/framework_injector_profiler';

describe('signalGraphTool', () => {
  beforeEach(() => {
    setupFrameworkInjectorProfiler();
  });

  it('should discover signal graph from targeted element', async () => {
    @Component({
      selector: 'signal-graph-test-root',
      template: '<div>Signals test: {{ double() }}</div>',
      standalone: true,
    })
    class SignalGraphTestComponent {
      private readonly count = signal(1, {debugName: 'count'});
      protected readonly double = computed(() => this.count() * 2, {debugName: 'double'});

      constructor() {
        effect(
          () => {
            this.double();
          },
          {debugName: 'consumer'},
        );
      }
    }

    const fixture = TestBed.createComponent(SignalGraphTestComponent);
    await fixture.whenStable();

    const rootElement = fixture.nativeElement;

    const result = await signalGraphTool.execute({target: rootElement});

    expect(result.nodes).toEqual(
      jasmine.arrayWithExactContents([
        jasmine.objectContaining({kind: 'signal', label: 'count', value: 1}),
        jasmine.objectContaining({kind: 'computed', label: 'double', value: 2}),
        jasmine.objectContaining({kind: 'effect', label: 'consumer'}),
        jasmine.objectContaining({kind: 'template'}),
      ]),
    );

    const countIndex = result.nodes.findIndex((n) => n.label === 'count');
    const doubleIndex = result.nodes.findIndex((n) => n.label === 'double');
    const consumerIndex = result.nodes.findIndex((n) => n.label === 'consumer');
    const templateIndex = result.nodes.findIndex((n) => n.kind === 'template');

    expect(result.edges).toEqual(
      jasmine.arrayWithExactContents([
        {consumer: consumerIndex, producer: doubleIndex},
        {consumer: doubleIndex, producer: countIndex},
        {consumer: templateIndex, producer: doubleIndex},
      ]),
    );
  });

  it('should throw an error if target is not an HTMLElement', async () => {
    await expectAsync(
      signalGraphTool.execute({target: {} as unknown as HTMLElement}),
    ).toBeRejectedWithError(/must be an HTMLElement/);
  });

  it('should throw an error if target is not an Angular component', async () => {
    await expectAsync(
      signalGraphTool.execute({target: document.createElement('div')}),
    ).toBeRejectedWithError(/not the host element of an Angular component/);
  });
});
