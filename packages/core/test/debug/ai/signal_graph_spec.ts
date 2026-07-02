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
import {getInjector} from '../../../src/render3/util/discovery_utils';
import {Injector} from '../../../src/di/injector';

describe('signalGraphTool', () => {
  beforeEach(() => {
    setupFrameworkInjectorProfiler();
  });

  it('should discover signal graph from targeted injector', async () => {
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
    const injector = getInjector(rootElement);

    const result = await signalGraphTool.execute({injector});

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

  it('should throw an error if injector is null', async () => {
    await expectAsync(signalGraphTool.execute({injector: null!})).toBeRejectedWithError(
      /undefined, null, or an instance of NullInjector/,
    );
  });

  it('should throw an error if injector is undefined', async () => {
    await expectAsync(signalGraphTool.execute({injector: undefined!})).toBeRejectedWithError(
      /undefined, null, or an instance of NullInjector/,
    );
  });

  it('should throw an error if injector is a NullInjector', async () => {
    await expectAsync(
      signalGraphTool.execute({injector: getInjector(document.createElement('div'))}),
    ).toBeRejectedWithError(/undefined, null, or an instance of NullInjector/);
  });
});
